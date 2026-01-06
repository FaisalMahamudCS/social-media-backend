import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { RegisterRequest, LoginRequest } from '../types';

export const register = async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        console.error('Registration error:', error);

        if (error.message === 'Username and password are required') {
            return res.status(400).json({ error: error.message });
        }

        if (error.message === 'Password must be at least 6 characters') {
            return res.status(400).json({ error: error.message });
        }

        if (error.message === 'Username already exists') {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    try {
        const result = await authService.login(req.body);
        res.json(result);
    } catch (error: any) {
        console.error('Login error:', error);

        if (error.message === 'Username and password are required') {
            return res.status(400).json({ error: error.message });
        }

        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ error: error.message });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
};
