import express from 'express';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import authRouter from './auth-router';
import dotenv from 'dotenv';
import { users } from './data/user-store';

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
    res.status(StatusCodes.OK).send('Hallo Obaid!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

console.log("Password ist::", users[0].password);