import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }

      const organizationId =
        request.query.organizationId || request.body.organizationId;

      if (!organizationId) {
        return true;
      }

      if (user.role === 'SUPERADMIN') {
        return true;
      }

      if (user.organizationId !== organizationId) {
        throw new ForbiddenException(
          'You do not have access to this organization',
        );
      }

      return true;
    } catch (error) {
      console.error('Organization guard error:', error);
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Authorization check failed');
    }
  }
}
