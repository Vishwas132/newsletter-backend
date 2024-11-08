import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const organizationId =
      request.query.organizationId || request.body.organizationId;

    // If no organization ID is provided in the request, allow the request
    // This is useful for super admin routes that don't require organization context
    if (!organizationId) {
      return true;
    }

    // Super admins can access all organizations
    if (user.role === 'SUPERADMIN') {
      return true;
    }

    // Check if the user belongs to the requested organization
    if (user.organizationId !== organizationId) {
      throw new ForbiddenException(
        'You do not have access to this organization',
      );
    }

    return true;
  }
}
