import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db/connection';
import { RegisterRequest, LoginRequest } from '../types';

export interface AuthResult {
  token: string;
  user: {
    id: number;
    username: string;
  };
}

export class AuthService {
  async register(data: RegisterRequest): Promise<AuthResult> {
    const { username, password } = data;

    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new Error('Username already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    return { token, user };
  }

  async login(data: LoginRequest): Promise<AuthResult> {
    const { username, password } = data;

    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    return { token, user: { id: user.id, username: user.username } };
  }
}

export const authService = new AuthService();
