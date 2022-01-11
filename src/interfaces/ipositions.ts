import { IPosition } from "./iposition";

export interface IPositions {
    [key: string]: IPosition;
    Agent: IPosition;
    PartTime: IPosition;
    Software: IPosition;
    SoftwareConsultant: IPosition;
}
