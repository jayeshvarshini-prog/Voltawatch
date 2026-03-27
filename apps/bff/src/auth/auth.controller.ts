import { Controller, Post, Body, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

function toHttpException(err: unknown): never {
  const message = err instanceof Error ? err.message : 'An error occurred';
  if (/invalid credentials/i.test(message))
    throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
  if (/already registered|already exists|conflict/i.test(message))
    throw new HttpException(message, HttpStatus.CONFLICT);
  if (/not found/i.test(message)) throw new HttpException(message, HttpStatus.NOT_FOUND);
  throw new HttpException(message, HttpStatus.BAD_REQUEST);
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    try {
      return await this.authService.login(body.email, body.password);
    } catch (err) {
      toHttpException(err);
    }
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    try {
      return await this.authService.register(body.email, body.password, body.name);
    } catch (err) {
      toHttpException(err);
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { token: string }) {
    try {
      return await this.authService.refresh(body.token);
    } catch (err) {
      toHttpException(err);
    }
  }
}
