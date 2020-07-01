import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  // Get the jwt token from the head

  const token = req.headers.auth as string;
  if (!token) {
    return res.status(403).send({
      auth: false, message: "No token provided."
    });
  }
  let jwtPayload;

  // Try to validate the token and get data
  try {
    jwtPayload = jwt.verify(token, config.jwtSecret) as any;
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    let errorCode: any;
    let errorMessage: any;
    if(error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      errorCode = 401;
      errorMessage = error.name;
    }
    // If token is not valid, respond with 401 (unauthorized)
    res.status(errorCode).send({
      auth: false,
      message: errorMessage
    });
    return;
  }

  // The token is valid for 1 hour
  // We want to send a new token on every request
  // const { userId, username } = jwtPayload;
  // const newToken = jwt.sign({ userId, username }, config.jwtSecret, {
  //   algorithm: "HS256", expiresIn: "1h"
  // });
  // res.setHeader("token", newToken);

  // Call the next middleware or controller
  next();
};