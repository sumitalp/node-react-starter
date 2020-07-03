import "reflect-metadata";
import {createConnection} from "typeorm";

import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";

import routes from "./routes";
import logger from "./utils/logger";

createConnection().then(async connection => {

  const app = express();

  // Call midlewares
  app.use(cors());
  app.use(helmet());
  app.use(bodyParser.json());

  // Set all routes from routes folder
  app.use("/", routes);

  const port = 3000;
  app.get('/', (req, res) => {
    res.send('The sedulous hyena ate the antelope! lsdkjflasdjk');
  });
  app.listen(port, err => {
    if (err) {
      return console.error(err);
    }
    return console.log(`server is listening on ${port}`);
  });

}).catch(error => logger.error("TypeORM connection error: ", error));
