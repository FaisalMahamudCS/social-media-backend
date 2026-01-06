import { calculationService } from '../calculationService';
import prisma from '../../db/connection';

jest.mock('../../db/connection');

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('CalculationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createStartingNumber', () => {
    it('should create a starting number successfully', async () => {
      mockPrisma.startingNumber.create = jest.fn().mockResolvedValue({
        id: 1,
        userId: 1,
        number: 42,
        createdAt: new Date(),
      });

      const result = await calculationService.createStartingNumber(1, { number: 42 });

      expect(result).toHaveProperty('id');
      expect(result.number).toBe(42);
    });

    it('should throw error for invalid number', async () => {
      await expect(
        calculationService.createStartingNumber(1, { number: 'not-a-number' as any })
      ).rejects.toThrow('Valid number is required');
    });
  });

  describe('createOperation', () => {
    it('should create an operation on starting number', async () => {
      mockPrisma.startingNumber.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        userId: 1,
        number: 5,
        createdAt: new Date(),
      });

      mockPrisma.operation.create = jest.fn().mockResolvedValue({
        id: 1,
        userId: 1,
        parentId: 1,
        parentOperationId: null,
        operationType: 'add',
        rightOperand: 10,
        result: 15,
        createdAt: new Date(),
      });

      const result = await calculationService.createOperation(1, {
        parent_id: 1,
        parent_type: 'starting',
        operation_type: 'add',
        right_operand: 10,
      });

      expect(result).toHaveProperty('id');
      expect(result.result).toBe(15);
    });

    it('should throw error for division by zero', async () => {
      mockPrisma.startingNumber.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        userId: 1,
        number: 5,
        createdAt: new Date(),
      });

      await expect(
        calculationService.createOperation(1, {
          parent_id: 1,
          parent_type: 'starting',
          operation_type: 'divide',
          right_operand: 0,
        })
      ).rejects.toThrow('Division by zero is not allowed');
    });
  });
});
