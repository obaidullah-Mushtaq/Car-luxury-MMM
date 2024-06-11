import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    payload?: any;
}

export const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error('No bearer token available');
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
        req.payload = decoded;
        next();
    } catch (err) {
        res.status(401).send(`Please authenticate! ${err}`);
    }
};
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const payload = (req as AuthRequest).payload;

        if (payload.user.role === 'admin') {
            next();
        } else {
            res.status(401).send('Admin role required');
        }
    } catch (err) {
        res.status(401).send('Authentication required');
    }
};
