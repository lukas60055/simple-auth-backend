import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from './ErrorHandler';
import { signJwt, verifyJwt } from '../utils/jwt';

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token: string = req.cookies.auth;

  if (!token) {
    throw new ErrorHandler(403, 'No token provided!');
  }

  try {
    const decoded = verifyJwt(token);

    const { iat, exp, ...restOfPayload } = decoded;

    // Refresh the token 15 minutes before it expires
    const currentTime = Math.floor(Date.now() / 1000);

    if (exp && exp - currentTime < 900) {
      const newToken = signJwt({ ...restOfPayload });

      res.cookie('auth', newToken, {
        secure: process.env.NODE_ENV === 'development' ? false : true,
        httpOnly: process.env.NODE_ENV === 'development' ? false : true,
        maxAge: Number(process.env.EXP_TOKEN) * 1000,
      });
    }

    next();
  } catch (error) {
    if (error instanceof Error) {
      next(new ErrorHandler(401, error.message));
    } else {
      next(new ErrorHandler(500, 'Unknown error occurred'));
    }
  }
};
