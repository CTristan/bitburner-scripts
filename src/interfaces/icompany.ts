import { IPosition } from "./iposition";

export interface ICompany {
    [key: string]: string | number | IPosition;
    name: string;
    repReq: number;
    salaryMult: number;
    position: IPosition;
}
