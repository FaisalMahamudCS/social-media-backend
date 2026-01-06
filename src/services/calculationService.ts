import prisma from '../db/connection';
import { CreateStartingNumberRequest, CreateOperationRequest, OperationNode } from '../types';

const calculateResult = (
  leftOperand: number,
  operationType: 'add' | 'subtract' | 'multiply' | 'divide',
  rightOperand: number
): number => {
  switch (operationType) {
    case 'add':
      return leftOperand + rightOperand;
    case 'subtract':
      return leftOperand - rightOperand;
    case 'multiply':
      return leftOperand * rightOperand;
    case 'divide':
      if (rightOperand === 0) {
        throw new Error('Division by zero is not allowed');
      }
      return leftOperand / rightOperand;
    default:
      throw new Error('Invalid operation type');
  }
};

export class CalculationService {
  async createStartingNumber(userId: number, data: CreateStartingNumberRequest) {
    const { number } = data;

    if (typeof number !== 'number' || isNaN(number)) {
      throw new Error('Valid number is required');
    }

    const startingNumber = await prisma.startingNumber.create({
      data: {
        userId,
        number,
      },
    });

    return startingNumber;
  }

  async createOperation(userId: number, data: CreateOperationRequest) {
    const { parent_id, parent_type, operation_type, right_operand } = data;

    if (!parent_id || !parent_type || !operation_type || typeof right_operand !== 'number') {
      throw new Error('Invalid request data');
    }

    if (!['add', 'subtract', 'multiply', 'divide'].includes(operation_type)) {
      throw new Error('Invalid operation type');
    }

    // Get the parent value
    let parentValue: number;
    if (parent_type === 'starting') {
      const parent = await prisma.startingNumber.findUnique({
        where: { id: parent_id },
        select: { number: true },
      });

      if (!parent) {
        throw new Error('Starting number not found');
      }

      parentValue = Number(parent.number);
    } else {
      const parent = await prisma.operation.findUnique({
        where: { id: parent_id },
        select: { result: true },
      });

      if (!parent) {
        throw new Error('Parent operation not found');
      }

      parentValue = Number(parent.result);
    }

    // Calculate result
    const result = calculateResult(parentValue, operation_type, right_operand);

    // Insert operation
    const operation = await prisma.operation.create({
      data: {
        userId,
        parentId: parent_type === 'starting' ? parent_id : null,
        parentOperationId: parent_type === 'operation' ? parent_id : null,
        operationType: operation_type,
        rightOperand: right_operand,
        result,
      },
    });

    return operation;
  }

  async getCalculationTree(): Promise<OperationNode[]> {
    // Get all starting numbers with user info
    const startingNumbers = await prisma.startingNumber.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const trees: OperationNode[] = [];

    for (const starting of startingNumbers) {
      const node: OperationNode = {
        id: starting.id,
        type: 'starting',
        user_id: starting.userId,
        value: Number(starting.number),
        created_at: starting.createdAt.toISOString(),
        children: [],
      };

      // Recursively build children
      const buildChildren = async (parentId: number, parentType: 'starting' | 'operation'): Promise<OperationNode[]> => {
        const children: OperationNode[] = [];

        const operations = await prisma.operation.findMany({
          where: parentType === 'starting' ? { parentId } : { parentOperationId: parentId },
          orderBy: {
            createdAt: 'asc',
          },
        });

        for (const op of operations) {
          const childNode: OperationNode = {
            id: op.id,
            type: 'operation',
            user_id: op.userId,
            value: Number(op.result),
            operation_type: op.operationType as 'add' | 'subtract' | 'multiply' | 'divide',
            right_operand: Number(op.rightOperand),
            created_at: op.createdAt.toISOString(),
            children: [],
          };

          childNode.children = await buildChildren(op.id, 'operation');
          children.push(childNode);
        }

        return children;
      };

      node.children = await buildChildren(starting.id, 'starting');
      trees.push(node);
    }

    return trees;
  }
}

export const calculationService = new CalculationService();
