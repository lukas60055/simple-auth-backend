import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import knex from '../../databases/knex';
import { ErrorHandler } from '../../middlewares/ErrorHandler';

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;

    let query = knex('users')
      .select(
        'users.id',
        'users.email',
        'users.firstName',
        'users.lastName',
        'users.create_data',
        'roles.name as role'
      )
      .leftJoin('user_roles', 'users.id', 'user_roles.userId')
      .leftJoin('roles', 'user_roles.roleId', 'roles.id');

    if (userId) {
      query = query.where('users.id', userId);
    }

    const result = await query;

    if (result.length === 0) {
      throw new ErrorHandler(404, 'User not found');
    }

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

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const role = req.body.role;

    if (!email || !password || !firstName || !lastName || !role) {
      throw new ErrorHandler(400, 'Bad request');
    }

    const existingUser = await knex('users').first('id').where({ email });

    if (existingUser) {
      throw new ErrorHandler(400, 'Account already exists');
    }

    const selectedRole = await knex('roles').first('id').where('name', role);

    if (!selectedRole) {
      throw new ErrorHandler(404, 'Role not found');
    }

    const hashPassword = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_SALT)
    );

    const userData = {
      email,
      password: hashPassword,
      firstName,
      lastName,
    };

    const [userId] = await knex('users').insert(userData);

    const userRoleData = {
      userId,
      roleId: selectedRole.id,
    };

    await knex('user_roles').insert(userRoleData);

    const response = {
      statusCode: 200,
      message: 'OK',
    };

    return res.status(response.statusCode).send(response);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;

    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const role = req.body.role;

    if (!email || !firstName || !lastName) {
      throw new ErrorHandler(400, 'Bad request');
    }

    const existingUser = await knex('users')
      .first('id', 'email')
      .where('id', userId);

    if (!existingUser) {
      throw new ErrorHandler(404, 'User not found');
    }

    const existingUserWithEmail = await knex('users')
      .first('id', 'email')
      .where({ email });

    if (existingUserWithEmail && existingUserWithEmail.id != userId) {
      throw new ErrorHandler(400, 'Email already exists');
    }

    const userData: any = {
      email,
      firstName,
      lastName,
      update_data: new Date(),
    };

    if (password) {
      const hashPassword = await bcrypt.hash(
        password,
        Number(process.env.BCRYPT_SALT)
      );
      userData.password = hashPassword;
    }

    if (role) {
      const selectedRole = await knex('roles').first('id').where('name', role);

      if (!selectedRole) {
        throw new ErrorHandler(404, 'Role not found');
      }

      const userRoleData = {
        roleId: selectedRole.id,
        add_data: new Date(),
      };

      await knex('user_roles').where({ userId }).update(userRoleData);
    }

    await knex('users').where('id', userId).update(userData);

    const response = {
      statusCode: 200,
      message: 'OK',
    };

    return res.status(response.statusCode).send(response);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      throw new ErrorHandler(400, 'Bad request');
    }

    const existingUser = await knex('users')
      .first('id', 'email')
      .where('id', userId);

    if (!existingUser) {
      throw new ErrorHandler(404, 'User not found');
    }

    await knex.transaction(async (trx) => {
      const deleteOperations = [
        trx('user_roles').where({ userId }).del(),
        trx('password_reset_tokens').where({ userId }).del(),
        trx('users').where('id', userId).del(),
      ];

      await Promise.all(deleteOperations);
    });

    const response = {
      statusCode: 200,
      message: 'OK',
    };

    return res.status(response.statusCode).send(response);
  } catch (error) {
    next(error);
  }
};
