import { Company } from "./company"
import { Crime } from "./crime"
import { Program } from "./program"

export const Factions: IMap<string> = {
    // Main Quest
    CyberSec: "CyberSec", // 18,750
    NiteSec: "NiteSec", // 112,500
    BlackHand: "The Black Hand", // 175,000
    BitRunners: "BitRunners", // 1,000,000

    // Side Quests
    Netburners: "Netburners", // 12,500
    SlumSnakes: "Slum Snakes", // 22,500
    Sector12: "Sector-12", // 50,000
    Ishima: "Ishima", // 50,000
    Volhaven: "Volhaven", // 50,000
    Tetrads: "Tetrads", // 62,500
    TianDiHui: "Tian Di Hui", // 75,000
    Aevum: "Aevum", // 100,000
    NewTokyo: "New Tokyo", // 112,500
    Chongqing: "Chongqing", // 112,500

    MegaCorp: "MegaCorp",
    ECorp: "ECorp",
    KuaiGong: "KuaiGong International",
    FourSigma: "Four Sigma",
    NWO: "NWO",
    Blade: "Blade Industries",
    OmniTek: "OmniTek Incorporated",
    Bachman: "Bachman & Associates",
    Clarke: "Clarke Incorporated",
    Fulcrum: "Fulcrum Secret Technologies",
    Silhouette: "Silhouette",
    Speakers: "Speakers for the Dead",
    DarkArmy: "The Dark Army",
    Syndicate: "The Syndicate",

    // Endgame

    Covenant: "The Covenant",
    Daedalus: "Daedalus",
    Illuminati: "Illuminati",
}

export const Cities: IMap<string> = {
    // Starting city
    Sector12: "Sector-12",

    // Allied city
    Aevum: "Aevum",

    // Other cities
    Chongqing: "Chongqing",
    Ishima: "Ishima",
    NewTokyo: "New Tokyo",
    Volhaven: "Volhaven",
}

export const Companies: IMap<Company> = {
    Fulcrum: { name: "Fulcrum Technologies", repReq: 250e3 },
    KuaiGong: { name: "KuaiGong International", repReq: 200e3 },
    Clarke: { name: "Clarke Incorporated", repReq: 200e3 },
    FourSigma: { name: "Four Sigma", repReq: 200e3 },
    Bachman: { name: "Bachman & Associates", repReq: 200e3 },
    NWO: { name: "NWO", repReq: 200e3 },
    Blade: { name: "Blade Industries", repReq: 200e3 },
    ECorp: { name: "ECorp", repReq: 200e3 },
    MegaCorp: { name: "MegaCorp", repReq: 200e3 },
}

export const Crimes: IMap<Crime> = {
    // Sorted by most profitable
    Heist: { name: "heist", time: 600 },
    Assassination: { name: "assassination", time: 300 },
    Kidnap: { name: "kidnap", time: 120 },
    GrandTheftAuto: { name: "grand theft auto", time: 80 },
    Homicide: { name: "homicide", time: 3 },
    TraffickArms: { name: "traffick arms", time: 40 },
    BondForgery: { name: "bond forgery", time: 300 },
    DealDrugs: { name: "deal drugs", time: 10 },
    Mug: { name: "mug", time: 4 },
    Larceny: { name: "larceny", time: 90 },
    Shoplift: { name: "shoplift", time: 2 },
    RobStore: { name: "rob store", time: 60 },
}

export const Programs: IMap<Program> = {
    BruteSSH: { name: "BruteSSH.exe", hackLevelReq: 50 },
    FTPCrack: { name: "FTPCrack.exe", hackLevelReq: 100 },
    RelaySMTP: { name: "relaySMTP.exe", hackLevelReq: 250 },
    HTTPWorm: { name: "HTTPWorm.exe", hackLevelReq: 500 },
    SQLInject: { name: "SQLInject.exe", hackLevelReq: 750 },
    DeepscanV1: { name: "DeepscanV1.exe", hackLevelReq: 75 },
    DeepscanV2: { name: "DeepscanV2.exe", hackLevelReq: 400 },
    AutoLink: { name: "AutoLink.exe", hackLevelReq: 25 },
    ServerProfiler: { name: "ServerProfiler.exe", hackLevelReq: 75 },
    Formulas: { name: "Formulas.exe", hackLevelReq: 1000 },
}

export const Tasks: IMap<string> = {
    Grow: "grow",
    Hack: "hack",
    Weaken: "weaken",
}

export const WorkTypes: IMap<string> = {
    Company: "Working for Company",
    CompanyPartTime: "Working for Company part-time",
    CreateProgram: "Working on Create a Program",
    Crime: "Committing a crime",
    Factions: "Working for Faction",
    StudyClass: "Studying or Taking a class at university",
}

// prettier-ignore
interface IMap<T> {
    [key: string]: T;
}
