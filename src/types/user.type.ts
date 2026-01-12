import { BaseType } from './global.type';

// Enums
export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

// User Entity (Response)
export interface UserData extends BaseType {
    email: string;
    fullName: string | null;
    dateOfBirth: string | null; // ISO Date String
    gender: Gender | null;
    monthlyLimit?: number;
}

// Update Profile Payload
export interface UpdateProfileForm {
    fullName?: string;
    dateOfBirth?: string; // YYYY-MM-DD
    gender?: Gender;
}

// Change Password Payload
export interface ChangePasswordForm {
    oldPassword: string;
    newPassword: string;
}
