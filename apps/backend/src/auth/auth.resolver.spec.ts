import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;

  const mockAuthResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: { id: 'user-1', email: 'test@test.com', name: 'Test' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(mockAuthResponse),
            register: jest.fn().mockResolvedValue(mockAuthResponse),
            refresh: jest.fn().mockResolvedValue(mockAuthResponse),
          },
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
  });

  it('should delegate login to AuthService', async () => {
    const result = await resolver.login({ email: 'test@test.com', password: 'password123' });
    expect(authService.login).toHaveBeenCalledWith('test@test.com', 'password123');
    expect(result).toEqual(mockAuthResponse);
  });

  it('should delegate register to AuthService', async () => {
    const result = await resolver.register({ email: 'test@test.com', password: 'password123', name: 'Test' });
    expect(authService.register).toHaveBeenCalledWith('test@test.com', 'password123', 'Test');
    expect(result).toEqual(mockAuthResponse);
  });

  it('should delegate refreshToken to AuthService', async () => {
    const result = await resolver.refreshToken('some-token');
    expect(authService.refresh).toHaveBeenCalledWith('some-token');
    expect(result).toEqual(mockAuthResponse);
  });
});
