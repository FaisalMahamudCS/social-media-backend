import { Request, Response } from 'express';
import { register, login } from '../authController';
import { authService } from '../../services/authService';

jest.mock('../../services/authService');

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockRequest.body = { username: 'testuser', password: 'password123' };

      mockAuthService.register = jest.fn().mockResolvedValue({
        token: 'test-token',
        user: { id: 1, username: 'testuser' },
      });

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'test-token',
        user: { id: 1, username: 'testuser' },
      });
    });

    it('should return error if username already exists', async () => {
      mockRequest.body = { username: 'existinguser', password: 'password123' };
      mockAuthService.register = jest.fn().mockRejectedValue(new Error('Username already exists'));

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username already exists' });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      mockRequest.body = { username: 'testuser', password: 'password123' };
      mockAuthService.login = jest.fn().mockResolvedValue({
        token: 'test-token',
        user: { id: 1, username: 'testuser' },
      });

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'test-token',
        user: { id: 1, username: 'testuser' },
      });
    });

    it('should return error for invalid credentials', async () => {
      mockRequest.body = { username: 'testuser', password: 'wrongpassword' };
      mockAuthService.login = jest.fn().mockRejectedValue(new Error('Invalid credentials'));

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });
  });
});
