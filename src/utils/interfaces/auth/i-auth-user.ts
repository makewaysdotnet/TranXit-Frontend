import { IUser } from './i-user';

export interface IAuthUser {
    token?: string;
    user?: IUser;
}
