import { expressjwt } from 'express-jwt';
import { Request, Response, NextFunction } from 'express';

const secretKey: string = process.env.JWT_SECRET_KEY as string; // Use environment variables in production

const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  expressjwt({
    secret: secretKey,
    algorithms: ['HS256'],
  })(req, res, next).catch(next); // Handle the promise rejection
};

export default authenticateToken;
