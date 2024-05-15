import { Request, Response, NextFunction } from 'express';
import knex from '../../databases/knex';

export const getRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await knex('roles').select('name', 'create_data');

    const response = {
      statusCode: 200,
      message: 'OK',
      data: result,
    };

    return res.status(response.statusCode).send(response);
  } catch (err) {
    next(err);
  }
};
