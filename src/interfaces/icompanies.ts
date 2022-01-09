export interface ICompanies {
    [key: string]: ICompany;
    Fulcrum: { name: string; repReq: number };
    KuaiGong: { name: string; repReq: number };
    Clarke: { name: string; repReq: number };
    FourSigma: { name: string; repReq: number };
    Bachman: { name: string; repReq: number };
    NWO: { name: string; repReq: number };
    Blade: { name: string; repReq: number };
    ECorp: { name: string; repReq: number };
    MegaCorp: { name: string; repReq: number };
}

interface ICompany {
    name: string;
    repReq: number;
}
