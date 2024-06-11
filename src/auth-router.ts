import express from 'express';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { users, User } from './data/user-store';
import { isAuthenticated, isAdmin } from './middleware/auth-handlers';

// Authentifizierungs-Router erstellen
export const authRouter = express.Router();

// Schnittstelle für Benutzeranmeldeinformationen

export interface UserCredentials {
    email: string;
    password: string;
}

// Endpunkt, um alle Benutzer abzurufen
authRouter.get('/users', isAuthenticated, isAdmin, (req, res) => {
    res.status(StatusCodes.OK).json(users);
});

// Endpunkt für das Login
authRouter.post('/login', (request, response) => {
    const loginUser: UserCredentials = request.body;

    const user = users.find((u) => u.email === loginUser.email);

    if (user === undefined) {
        response.status(StatusCodes.UNAUTHORIZED).json("User does not exist");
        return;
    }

    if(!bcrypt.compareSync(loginUser.password, user.password)) {
        response.status(StatusCodes.UNAUTHORIZED).json("Invalid password");
        return;
    }
    /*
    Benutzerinformationen (Claims) werden gesammelt.
    Ein Ablaufdatum für den Token wird festgelegt.
    Der Token wird mit der jwt.sign() Methode erstellt, wobei die Benutzerinformationen und das Ablaufdatum in den Payload des Tokens aufgenommen werden.
    Der erzeugte Token wird zusammen mit den Claims und dem Ablaufdatum an den Client zurückgegeben.
     */
    const userClaims = {
        email: user.email,
        role: user.role,
    };
    const minutes = 15;
    const expiresAt = new Date(Date.now() + minutes * 60000);
    const token = jwt.sign(
        {
            user: userClaims,
            exp: expiresAt.getTime() / 1000,
        },
        process.env.SECRET_KEY as string
    );

    response.status(StatusCodes.OK).json({
        userClaims,
        expiresAt: expiresAt.getTime(),
        accessToken: token,
    });
});

// Endpunkt für die Registrierung
authRouter.post('/register', (req, res) => {
    const { email, password, fullName, role } = req.body;
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        return res.status(StatusCodes.CONFLICT).json('User already exists');
    }

    const hashedPassword = bcrypt.hashSync(password, 8); // Passwort hashen
    const newUser: User = { email, password: hashedPassword, fullName, role };
    users.push(newUser); // Neuen Benutzer zur Liste hinzufügen

    res.status(StatusCodes.CREATED).json(newUser);
});

export default authRouter;
