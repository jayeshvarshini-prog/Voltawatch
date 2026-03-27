import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client/core';
import fetch from 'cross-fetch';
import { generateReading } from './generator';

const endpoint =
  process.argv.find((a) => a.startsWith('--endpoint='))?.split('=')[1] ||
  'http://localhost:5000/graphql';

const interval = parseInt(
  process.argv.find((a) => a.startsWith('--interval='))?.split('=')[1] || '30000',
  10,
);

const client = new ApolloClient({
  link: new HttpLink({ uri: endpoint, fetch }),
  cache: new InMemoryCache(),
  defaultOptions: { mutate: { fetchPolicy: 'no-cache' } },
});

const GET_CARS = gql`
  query GetCars {
    cars {
      id
      model
    }
  }
`;

const UPSERT_READING = gql`
  mutation UpsertReading($input: CreateTelemetryInput!) {
    upsertReading(input: $input) {
      id
      carId
      batteryPercentage
      speedKmh
      isCharging
    }
  }
`;

async function run() {
  console.log(`VoltaWatch Simulator`);
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Interval: ${interval / 1000}s`);
  console.log('');

  let cars: { id: string; model: string }[];
  try {
    const { data } = await client.query({ query: GET_CARS });
    cars = data.cars;
  } catch (err: any) {
    console.error('Failed to fetch cars:', err.message);
    process.exit(1);
  }

  console.log(`Found ${cars.length} cars:`);
  cars.forEach((c) => console.log(`  - ${c.model} (${c.id.slice(0, 8)}...)`));
  console.log('');
  console.log('Sending telemetry readings...');
  console.log('');

  // Send initial batch immediately
  await sendReadings(cars);

  // Then on interval
  setInterval(() => sendReadings(cars), interval);
}

async function sendReadings(cars: { id: string; model: string }[]) {
  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];
    const reading = generateReading(car.id, i);

    try {
      const { data } = await client.mutate({
        mutation: UPSERT_READING,
        variables: { input: reading },
      });

      const r = data.upsertReading;
      const status = r.isCharging ? 'CHARGING' : r.speedKmh > 0 ? 'DRIVING' : 'PARKED';
      const faults = reading.faultCodes.length > 0 ? ` [${reading.faultCodes.join(',')}]` : '';

      console.log(
        `[${new Date().toISOString()}] ${car.model}: ` +
          `${status} | Battery: ${r.batteryPercentage}% | Speed: ${Math.round(r.speedKmh)} km/h${faults}`,
      );
    } catch (err: any) {
      console.error(`[${new Date().toISOString()}] Failed for ${car.model}: ${err.message}`);
    }
  }
}

run().catch(console.error);
