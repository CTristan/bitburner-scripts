import { IProgram } from "./iprogram"

export interface IPrograms {
    [key: string]: IProgram
    AutoLink: IProgram
    BruteSSH: IProgram
    DeepscanV1: IProgram
    DeepscanV2: IProgram
    FTPCrack: IProgram
    HTTPWorm: IProgram
    RelaySMTP: IProgram
    ServerProfiler: IProgram
    SQLInject: IProgram

    // Removing until I find a use case
    // Formulas: IProgram;
}
