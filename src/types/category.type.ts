import { BaseType } from './global.type';

export enum CategoryType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
}

export interface Category extends BaseType {
    name: string;
    type: CategoryType;
    icon?: string;
    color?: string;
}

export interface CategoryData extends Category {
    createdAt: string;
    updatedAt: string;
}

export interface CategoryForm {
    name: string;
    type: CategoryType;
    icon?: string;
    color?: string;
}
