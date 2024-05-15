import { Request, Response, NextFunction } from 'express';
import knex from '../databases/knex';
import { ErrorHandler } from './ErrorHandler';
import { verifyJwt } from '../utils/jwt';

const checkRoles = async (req: Request) => {
  const token = req.cookies.auth;
  if (!token) {
    throw new ErrorHandler(401, 'No authentication token found');
  }

  const { id } = verifyJwt(token);
  if (!id) {
    throw new ErrorHandler(403, 'Invalid token');
  }

  const userWithRoles = await knex('users')
    .select('users.id', 'roles.name as role')
    .where('users.id', id)
    .innerJoin('user_roles', 'users.id', 'user_roles.userId')
    .innerJoin('roles', 'user_roles.roleId', 'roles.id');

  if (!userWithRoles || userWithRoles.length === 0) {
    throw new ErrorHandler(403, 'Forbidden!');
  }

  return userWithRoles.map((user) => user.role);
};

const checkRole =
  (roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoles = await checkRoles(req);

      const hasRole = roles.some((role) => userRoles.includes(role));
      if (!hasRole) {
        throw new ErrorHandler(403, 'Forbidden!');
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export const isAdmin = checkRole(['admin']);
export const isAdminOrModerator = checkRole(['admin', 'moderator']);
