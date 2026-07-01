import { userType } from './constants';

export type JWTPayloadType = {
    id: number;
    userType: userType;
}

export type AccessTokenType = {
    accessToken: string;
}

export type AuthTokensType = {
    accessToken: string;
    refreshToken: string;
}