import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  async check() {
    let backendStatus = 'unreachable';
    const backendUrl = process.env.GRAPHQL_ENDPOINT || 'http://localhost:5000/graphql';

    try {
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ health { status database } }' }),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        backendStatus = 'reachable';
      }
    } catch {
      backendStatus = 'unreachable';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      backend: backendStatus,
    };
  }
}
