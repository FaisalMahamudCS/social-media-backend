import { Request, Response } from 'express';
import { calculationService } from '../services/calculationService';
import { AuthRequest } from '../middleware/auth';
import { CreateStartingNumberRequest, CreateOperationRequest } from '../types';

export const createStartingNumber = async (req: AuthRequest<{}, {}, CreateStartingNumberRequest>, res: Response) => {
    try {
        const userId = req.userId!;
        const startingNumber = await calculationService.createStartingNumber(userId, req.body);
        res.status(201).json(startingNumber);
    } catch (error: any) {
        console.error('Error creating starting number:', error);

        if (error.message === 'Valid number is required') {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createOperation = async (req: AuthRequest<{}, {}, CreateOperationRequest>, res: Response) => {
    try {
        const userId = req.userId!;
        const operation = await calculationService.createOperation(userId, req.body);
        res.status(201).json(operation);
    } catch (error: any) {
        console.error('Error creating operation:', error);

        if (error.message === 'Invalid request data' || error.message === 'Invalid operation type') {
            return res.status(400).json({ error: error.message });
        }

        if (error.message === 'Starting number not found' || error.message === 'Parent operation not found') {
            return res.status(404).json({ error: error.message });
        }

        if (error.message === 'Division by zero is not allowed') {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getCalculationTree = async (req: Request, res: Response) => {
    try {
        const tree = await calculationService.getCalculationTree();
        res.json(tree);
    } catch (error) {
        console.error('Error fetching calculation tree:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
