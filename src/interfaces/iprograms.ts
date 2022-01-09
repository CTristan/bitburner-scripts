export interface IPrograms {
    [key: string]: IProgram;
    BruteSSH: { name: string; hackLevelReq: number };
    FTPCrack: { name: string; hackLevelReq: number };
    RelaySMTP: { name: string; hackLevelReq: number };
    HTTPWorm: { name: string; hackLevelReq: number };
    SQLInject: { name: string; hackLevelReq: number };
    DeepscanV1: { name: string; hackLevelReq: number };
    DeepscanV2: { name: string; hackLevelReq: number };
    AutoLink: { name: string; hackLevelReq: number };
    ServerProfiler: { name: string; hackLevelReq: number };
    Formulas: { name: string; hackLevelReq: number };
}

interface IProgram {
    name: string;
    hackLevelReq: number;
}
