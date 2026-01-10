// User entity
export interface User {
    id: string;
    email: string;
    fullName: string | null;
    createdAt: string;
}

// Auth forms
export interface LoginForm {
    email: string;
    password: string;
}

export interface RegisterForm {
    email: string;
    password: string;
    fullName: string;
}

// Auth response
export interface LoginResponse {
    access_token: string;
    user: User;
}

export interface RegisterResponse {
    access_token: string;
    user: User;
}
