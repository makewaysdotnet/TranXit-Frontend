import { IAuthUser } from '../interfaces/auth/i-user';

export type AuthUser = {
    token: string;
    user: IAuthUser;
};

export type TLogin = {
    email: string;
    password: string;
};

export type AuthResponse = {
    message: string;
    data?: AuthUser;
    success?: boolean;
};
