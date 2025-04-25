import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

export async function authenticateToken({ req }: any): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return req;
  }

  const token = authHeader.split(" ")[1];

  const secretKey = process.env.JWT_SECRET_KEY || "";

  try {
    const user = jwt.verify(token, secretKey) as JwtPayload;
    req.user = user;
    return req;
  } catch (err) {
    throw new Error("Invalid token");
  }
}

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || "";

  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};
