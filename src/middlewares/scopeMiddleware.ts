import { Request, Response, NextFunction } from 'express';
import { Request as JwtRequest } from 'express-jwt';
import { USER_ROLES } from '../config/roles';

const checkScope = (requiredScope: string) => {
  return (req: JwtRequest, res: Response, next: NextFunction) => {
    const userRole = req.auth?.role;

    // Check if userRole is defined and if it has the required scope
    if (!userRole) {
      res.status(401).json({ message: 'Unauthorized: No role found' });
      return;
    }

    if (!USER_ROLES[userRole as keyof typeof USER_ROLES]?.includes(requiredScope)) {
      res.status(403).json({ message: 'Forbidden: Insufficient scope' });
      return;
    }

    next();
  };
};

export default checkScope;
