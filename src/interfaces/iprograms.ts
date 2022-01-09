import { IProgram } from "./iprogram";

export interface IPrograms {
    [key: string]: IProgram;
    AutoLink: IProgram;
    BruteSSH: IProgram;
    DeepscanV1: IProgram;
    DeepscanV2: IProgram;
    Formulas: IProgram;
    FTPCrack: IProgram;
    HTTPWorm: IProgram;
    RelaySMTP: IProgram;
    ServerProfiler: IProgram;
    SQLInject: IProgram;
}
