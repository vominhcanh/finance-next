import { BaseType } from './global.type';

export interface Bank extends BaseType {
    name: string;
    code: string;
    shortName: string;
    logo: string;
    bin?: string;
    isTransfer?: boolean;
}
