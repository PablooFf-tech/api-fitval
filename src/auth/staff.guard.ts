import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../users/user';
import { UsersService } from '../users/users.service';

@Injectable()
export class StaffGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as User | undefined;

    if (!user) {
      throw new ForbiddenException('Solo para el personal del gimnasio');
    }

    // Consulta el rol actual en base de datos tal como requiere el ejercicio
    const currentUser = await this.usersService.findById(user.id);
    if (!currentUser || currentUser.role !== 'staff') {
      throw new ForbiddenException('Solo para el personal del gimnasio');
    }

    // Actualiza el usuario con el rol fresco de la BD
    request['user'] = currentUser;
    return true;
  }
}
