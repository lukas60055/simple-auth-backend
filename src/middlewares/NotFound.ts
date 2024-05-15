import { Request, Response, NextFunction } from 'express';

const NotFound = (req: Request, res: Response, next: NextFunction) => {
  const message = `Not found ${req.method} ${req.originalUrl}`;

  next({ statusCode: 404, message });
};

export default NotFound;
