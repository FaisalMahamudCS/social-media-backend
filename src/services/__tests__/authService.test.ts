import { authService } from '../authService';
import prisma from '../../db/connection';
import bcrypt from 'bcryptjs';

jest.mock('../../db/connection');
jest.mock('bcryptjs');

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);
      mockPrisma.user.create = jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      const result = await authService.register({
        username: 'testuser',
        password: 'password123',
      });

      expect(result).toHaveProperty('token');
      expect(result.user).toEqual({ id: 1, username: 'testuser' });
    });

    it('should throw error if username already exists', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        username: 'existinguser',
        passwordHash: 'hash',
        createdAt: new Date(),
      });

      await expect(
        authService.register({
          username: 'existinguser',
          password: 'password123',
        })
      ).rejects.toThrow('Username already exists');
    });

    it('should throw error if password is too short', async () => {
      await expect(
        authService.register({
          username: 'testuser',
          password: '123',
        })
      ).rejects.toThrow('Password must be at least 6 characters');
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        passwordHash: 'hashedpassword',
        createdAt: new Date(),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(result).toHaveProperty('token');
      expect(result.user).toEqual({ id: 1, username: 'testuser' });
    });

    it('should throw error for invalid credentials', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        passwordHash: 'hashedpassword',
        createdAt: new Date(),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          username: 'testuser',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
