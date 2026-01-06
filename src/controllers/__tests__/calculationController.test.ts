import { Response } from 'express';
import { createStartingNumber, createOperation, getCalculationTree } from '../calculationController';
import { AuthRequest } from '../../middleware/auth';
import { calculationService } from '../../services/calculationService';

jest.mock('../../services/calculationService');

const mockCalculationService = calculationService as jest.Mocked<typeof calculationService>;

describe('Calculation Controller', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      userId: 1,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('createStartingNumber', () => {
    it('should create a starting number successfully', async () => {
      mockRequest.body = { number: 42 };
      mockCalculationService.createStartingNumber = jest.fn().mockResolvedValue({
        id: 1,
        userId: 1,
        number: 42,
        createdAt: new Date(),
      });

      await createStartingNumber(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return error for invalid number', async () => {
      mockRequest.body = { number: 'not-a-number' };
      mockCalculationService.createStartingNumber = jest.fn().mockRejectedValue(
        new Error('Valid number is required')
      );

      await createStartingNumber(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Valid number is required' });
    });
  });

  describe('createOperation', () => {
    it('should create an operation on starting number', async () => {
      mockRequest.body = {
        parent_id: 1,
        parent_type: 'starting',
        operation_type: 'add',
        right_operand: 10,
      };

      mockCalculationService.createOperation = jest.fn().mockResolvedValue({
        id: 1,
        userId: 1,
        parentId: 1,
        parentOperationId: null,
        operationType: 'add',
        rightOperand: 10,
        result: 15,
        createdAt: new Date(),
      });

      await createOperation(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return error for division by zero', async () => {
      mockRequest.body = {
        parent_id: 1,
        parent_type: 'starting',
        operation_type: 'divide',
        right_operand: 0,
      };
      mockCalculationService.createOperation = jest.fn().mockRejectedValue(
        new Error('Division by zero is not allowed')
      );

      await createOperation(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Division by zero is not allowed' });
    });
  });
});
