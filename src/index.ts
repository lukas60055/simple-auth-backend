import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes';
import NotFound from './middlewares/NotFound';
import { handleError } from './middlewares/ErrorHandler';

require('dotenv').config();

const app = express();
const port = Number(process.env.PORT);

app.use(
  cors({
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

app.use(router);

app.use(NotFound);
app.use(handleError);

app.listen(port, '0.0.0.0', () => {
  console.log(
    `[${process.env.NODE_ENV}] Server listening on http://localhost:${port}`
  );
});
