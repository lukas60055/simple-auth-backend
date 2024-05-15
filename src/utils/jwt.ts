import jwt, { Secret, SignOptions } from 'jsonwebtoken';

type PayLoadJWT = {
  id?: number;
  token?: string;
  iat?: number;
  exp?: number;
};

export const signJwt = (payload: PayLoadJWT, options?: SignOptions): string => {
  const defaultOptions = {
    expiresIn: Number(process.env.EXP_TOKEN),
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN as Secret, finalOptions);
};

export const verifyJwt = (
  token: string,
  options?: jwt.VerifyOptions
): PayLoadJWT => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN as Secret,
      options
    );
    if (typeof decoded === 'string') {
      throw new Error('Token is invalid or expired and returned as string');
    }

    return decoded as PayLoadJWT;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
