import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { User } from "../entity/User";
import config from "../config/config";

class AuthController {
  static login = async (req: Request, res: Response) => {
    // Check if username and password are set
    const { username, password } = req.body;
    if (!(username && password)) {
      res.status(400).send();
    }

    // Get user from database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { username } });

      // Check if encrypted password match
      if (!user.checkIfUnencryptedPasswordIsValid(password)) {
        res.status(401).send();
        return;
      }

      // Sing JWT, valid for 1 hour
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        config.jwtSecret,
        { algorithm: "HS256", expiresIn: "1h" }
      );

      // Send the jwt in the response
      res.send({"token":token});
    } catch (error) {
      res.status(401).send();
    }
  };

  static refresh = async (req: Request, res: Response) => {
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
    } catch (error) {

      if(error.name === "JsonWebTokenError") {

        return res.status(401).send({
          auth: false,
          message: error.name
        });
      }
      // If token is not valid, respond with 401 (unauthorized)
      return res.status(400).send({
        auth: false,
        message: "Bad Request"
      });
    }

    const nowUnixSeconds = Math.round(Number(new Date()) / 1000)
    if (jwtPayload.expiresIn - nowUnixSeconds > 3600) {
      return res.status(400).send({
        auth: false,
        message: "Bad Request"
      })
    }

    // The token is valid for 1 hour
    // We want to send a new token on every request
    const { userId, username } = jwtPayload;
    const newToken = jwt.sign({ userId, username }, config.jwtSecret, {
      algorithm: "HS256", expiresIn: "1h"
    });
    res.setHeader("token", newToken);
  };

  static changePassword = async (req: Request, res: Response) => {
    // Get ID from JWT
    const id = res.locals.jwtPayload.userId;

    // Get parameters from the body
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res.status(400).send();
    }

    // Get user from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);

      // Check if old password matchs
      if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
        res.status(401).send();
        return;
      }

      // Validate de model (password lenght)
      user.password = newPassword;
      const errors = await validate(user);
      if (errors.length > 0) {
        res.status(400).send(errors);
        return;
      }
      // Hash the new password and save
      user.hashPassword();
      userRepository.save(user);

      res.status(204).send();
    } catch (id) {
      res.status(401).send();
    }
  };
}
export default AuthController;