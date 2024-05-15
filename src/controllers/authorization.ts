import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import knex from '../databases/knex';
import { ErrorHandler } from '../middlewares/ErrorHandler';
import { signJwt, verifyJwt } from '../utils/jwt';
import { sendMail } from '../utils/mailer';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const existingToken = req.cookies.auth;

    if (!email || !password) {
      throw new ErrorHandler(400, 'Bad request');
    }

    if (existingToken) {
      const isTokenValid = verifyJwt(existingToken);
      if (isTokenValid) {
        throw new ErrorHandler(401, 'User already logged in');
      }
    }

    const user = await knex('users')
      .first('id', 'email', 'password')
      .where({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new ErrorHandler(401, 'Invalid email or password');
    }

    const tokenPayload = {
      id: user.id,
    };

    const token = signJwt(tokenPayload);

    await knex('password_reset_tokens')
      .first('userId')
      .where('userId', user.id)
      .del();

    const response = {
      statusCode: 200,
      message: 'OK',
    };

    return res
      .status(response.statusCode)
      .cookie('auth', token, {
        secure: process.env.NODE_ENV === 'development' ? false : true,
        httpOnly: process.env.NODE_ENV === 'development' ? false : true,
        maxAge: Number(process.env.EXP_TOKEN) * 1000,
      })
      .send(response);
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    if (!email || !password || !firstName || !lastName) {
      throw new ErrorHandler(400, 'Bad request');
    }

    const existingUser = await knex('users').first('id').where({ email });

    if (existingUser) {
      throw new ErrorHandler(404, 'Account already exists');
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

    await knex('users').insert(userData);

    const response = {
      statusCode: 200,
      message: 'OK',
    };

    return res.status(response.statusCode).send(response);
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = {
      statusCode: 200,
      message: 'OK',
    };

    return res.status(response.statusCode).clearCookie('auth').send(response);
  } catch (err) {
    next(err);
  }
};

export const requestResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.body.email;

    const user = await knex('users').first('id').where({ email });

    if (!user) {
      throw new ErrorHandler(404, 'Email does not exist');
    }

    await knex('password_reset_tokens')
      .first('userId')
      .where('userId', user.id)
      .del();

    const resetToken = crypto.randomBytes(16).toString('hex');

    const expirationSeconds = parseInt(
      process.env.EXP_TOKEN_RESET || '300',
      10
    );
    const expiresData = new Date(Date.now() + expirationSeconds * 1000);

    const tokenData = {
      userId: user.id,
      token: resetToken,
      expires_data: expiresData,
    };

    await knex('password_reset_tokens').insert(tokenData);

    const emailSent = await sendMail(
      email,
      'Password Reset',
      `Password reset link: ${process.env.DOMAIN_APP}/reset?token=${resetToken}`
    );

    if (!emailSent) {
      throw new ErrorHandler(500, 'Failed to send password reset email');
    }

    const response = {
      statusCode: 200,
      message: 'OK',
    };

    return res.status(response.statusCode).send(response);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.body.token;
    const password = req.body.password;

    if (!token || !password) {
      throw new ErrorHandler(400, 'Bad request');
    }

    const tokenRecord = await knex('password_reset_tokens')
      .first('userId', 'expires_data')
      .where({ token });

    if (!tokenRecord || new Date() > new Date(tokenRecord.expires_data)) {
      if (tokenRecord) {
        await knex('password_reset_tokens').where({ token }).del();
      }
      throw new ErrorHandler(401, 'Invalid or expired token');
    }

    const hashPassword = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_SALT)
    );

    await knex('users')
      .update({ password: hashPassword })
      .where('id', tokenRecord.userId);

    await knex('password_reset_tokens')
      .where('userId', tokenRecord.userId)
      .del();

    const response = {
      statusCode: 200,
      message: 'OK',
    };

    return res.status(response.statusCode).send(response);
  } catch (err) {
    next(err);
  }
};
