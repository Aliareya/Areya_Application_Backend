import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    const token = request.cookies?.jwt;

    if (!token) {
      throw new UnauthorizedException('لطفاً وارد حساب کاربری خود شوید.');
    }

    try {
      const payload = this.jwtService.verify(token);
      
      request.user = payload; 
      
      return true; 
    } catch (error) {
      throw new UnauthorizedException('توکن نامعتبر یا منقضی شده است.');
    }
  }
}