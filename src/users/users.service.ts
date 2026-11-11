import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { toUser, User, UserRow } from './user';

@Injectable()
export class UsersService {
  constructor(private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<UserRow | null> {
    const result = await this.pool.query<UserRow>(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email],
    );
    return result.rows[0] ?? null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      'SELECT id, email, password_hash, role FROM users WHERE id = $1',
      [id],
    );
    return result.rows[0] ? toUser(result.rows[0]) : null;
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const result = await this.pool.query<UserRow>(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, password_hash, role`,
      [email, passwordHash],
    );
    return toUser(result.rows[0]);
  }
}
