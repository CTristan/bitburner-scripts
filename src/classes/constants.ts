/* eslint-disable sort-keys */
import { ICities } from "/interfaces/icities.js";
import { ICompanies } from "/interfaces/icompanies.js";
import { ICrimes } from "/interfaces/icrimes.js";
import { IFactions } from "/interfaces/ifactions.js";
import { IPositions } from "/interfaces/ipositions.js";
import { IPrograms } from "/interfaces/iprograms.js";
import { IStats } from "/interfaces/istats.js";
import { ITasks } from "/interfaces/itasks.js";
import { IWorkTypes } from "/interfaces/iworktypes.js";

export const Cities: ICities = {
    // Starting city
    Sector12: "Sector-12",

    // Allied city
    Aevum: "Aevum",

    // Other cities
    Chongqing: "Chongqing",
    Ishima: "Ishima",
    NewTokyo: "New Tokyo",
    Volhaven: "Volhaven",
};

export const Factions: IFactions = {
    // Main Quest
    CyberSec: { name: "CyberSec", cities: [], enemies: [] }, // 18,750
    NiteSec: { name: "NiteSec", cities: [], enemies: [] }, // 112,500
    BlackHand: {
        name: "The Black Hand",
        cities: [],
        enemies: [],
    }, // 175,000
    BitRunners: { name: "BitRunners", cities: [], enemies: [] }, // 1,000,000
    Daedalus: { name: "Daedalus", cities: [], enemies: [] }, // 2,500,000

    // Side Quests
    Netburners: { name: "Netburners", cities: [], enemies: [] }, // 12,500
    SlumSnakes: { name: "Slum Snakes", cities: [], enemies: [] }, // 22,500
    Sector12: {
        name: "Sector-12",
        cities: [Cities.Sector12],
        enemies: [
            Cities.Chongqing,
            Cities.Ishima,
            Cities.NewTokyo,
            Cities.Volhaven,
        ],
    }, // 50,000
    Ishima: {
        name: "Ishima",
        cities: [Cities.Ishima],
        enemies: [Cities.Aevum, Cities.Sector12, Cities.Volhaven],
    }, // 50,000
    Volhaven: {
        name: "Volhaven",
        cities: [Cities.Volhaven],
        enemies: [
            Cities.Aevum,
            Cities.Chongqing,
            Cities.Ishima,
            Cities.NewTokyo,
            Cities.Sector12,
        ],
    }, // 50,000
    Tetrads: {
        name: "Tetrads",
        cities: [Cities.Chongqing, Cities.Ishima, Cities.NewTokyo],
        enemies: [],
    }, // 62,500
    TianDiHui: {
        name: "Tian Di Hui",
        cities: [Cities.Chongqing, Cities.Ishima, Cities.NewTokyo],
        enemies: [],
    }, // 75,000
    Aevum: {
        name: "Aevum",
        cities: [Cities.Aevum],
        enemies: [
            Cities.Chongqing,
            Cities.Ishima,
            Cities.NewTokyo,
            Cities.Volhaven,
        ],
    }, // 100,000
    Chongqing: {
        name: "Chongqing",
        cities: [Cities.Chongqing],
        enemies: [Cities.Aevum, Cities.Sector12, Cities.Volhaven],
    }, // 112,500
    NewTokyo: {
        name: "New Tokyo",
        cities: [Cities.NewTokyo],
        enemies: [Cities.Aevum, Cities.Sector12, Cities.Volhaven],
    }, // 112,500
    Blade: { name: "Blade Industries", cities: [], enemies: [] }, // 562,500
    Fulcrum: {
        name: "Fulcrum Secret Technologies",
        cities: [],
        enemies: [],
    }, // 1,625,000

    MegaCorp: { name: "MegaCorp", cities: [], enemies: [] },
    ECorp: { name: "ECorp", cities: [], enemies: [] },
    KuaiGong: { name: "KuaiGong International", cities: [], enemies: [] },
    FourSigma: { name: "Four Sigma", cities: [], enemies: [] },
    NWO: { name: "NWO", cities: [], enemies: [] },
    OmniTek: { name: "OmniTek Incorporated", cities: [], enemies: [] },
    Bachman: { name: "Bachman & Associates", cities: [], enemies: [] },
    Clarke: { name: "Clarke Incorporated", cities: [], enemies: [] },
    Silhouette: { name: "Silhouette", cities: [], enemies: [] },
    SpeakersForTheDead: {
        name: "Speakers for the Dead",
        cities: [],
        enemies: [],
    },
    DarkArmy: {
        name: "The Dark Army",
        cities: [Cities.Chongqing],
        enemies: [],
    },
    Syndicate: {
        name: "The Syndicate",
        cities: [Cities.Sector12, Cities.Aevum],
        enemies: [],
    },

    // Endgame
    Covenant: { name: "The Covenant", cities: [], enemies: [] }, // 1,250,000
    Illuminati: { name: "Illuminati", cities: [], enemies: [] },
};

export const Positions: IPositions = {
    Agent: { name: "Agent", repMin: 8000 },
    PartTime: { name: "part-time Employee", repMin: 0 },
    Software: { name: "Software", repMin: 0 },
    SoftwareConsultant: { name: "Software Consultant", repMin: 0 },
};

export const Companies: ICompanies = {
    // Companies with their own faction
    MegaCorp: {
        name: "MegaCorp",
        repReq: 200e3,
        salaryMult: 3,
        position: Positions.Software,
    },
    ECorp: {
        name: "ECorp",
        repReq: 200e3,
        salaryMult: 3,
        position: Positions.Software,
    },
    Blade: {
        name: "Blade Industries",
        repReq: 200e3,
        salaryMult: 2.75,
        position: Positions.Software,
    },
    NWO: {
        name: "NWO",
        repReq: 200e3,
        salaryMult: 2.75,
        position: Positions.Software,
    },
    Bachman: {
        name: "Bachman & Associates",
        repReq: 200e3,
        salaryMult: 2.6,
        position: Positions.Software,
    },
    Clarke: {
        name: "Clarke Incorporated",
        repReq: 200e3,
        salaryMult: 2.25,
        position: Positions.Software,
    },
    OmniTek: {
        name: "OmniTek Incorporated",
        repReq: 200e3,
        salaryMult: 2.25,
        position: Positions.Software,
    },
    FourSigma: {
        name: "Four Sigma",
        repReq: 200e3,
        salaryMult: 2.5,
        position: Positions.Software,
    },
    KuaiGong: {
        name: "KuaiGong International",
        repReq: 200e3,
        salaryMult: 2.2,
        position: Positions.Software,
    },
    Fulcrum: {
        name: "Fulcrum Technologies",
        repReq: 250e3,
        salaryMult: 2,
        position: Positions.Software,
    },

    // Companies that have an Agent position
    CIA: {
        name: "Central Intelligence Agency",
        repReq: 8e3,
        salaryMult: 2,
        position: Positions.Agent,
    },
    NSA: {
        name: "National Security Agency",
        repReq: 8e3,
        salaryMult: 2,
        position: Positions.Agent,
    },
    Carmichael: {
        name: "Carmichael Security",
        repReq: 8e3,
        salaryMult: 1.2,
        position: Positions.Agent,
    },

    // Always available
    FoodNStuff: {
        name: "FoodNStuff",
        repReq: 0,
        salaryMult: 1,
        position: Positions.PartTime,
    },
};

export const Crimes: ICrimes = {
    Assassination: {
        name: "assassination",
        time: 300,
        money: 12000000,
        strExp: 300,
        defExp: 300,
        dexExp: 300,
        agiExp: 300,
        chaExp: 0,
    },
    BondForgery: {
        name: "bond forgery",
        time: 300,
        money: 4500,
        strExp: 0,
        defExp: 0,
        dexExp: 150,
        agiExp: 0,
        chaExp: 15,
    },
    DealDrugs: {
        name: "deal drugs",
        time: 10,
        money: 120,
        strExp: 0,
        defExp: 0,
        dexExp: 5,
        agiExp: 5,
        chaExp: 10,
    },
    GrandTheftAuto: {
        name: "grand theft auto",
        time: 80,
        money: 1600,
        strExp: 20,
        defExp: 20,
        dexExp: 20,
        agiExp: 80,
        chaExp: 40,
    },
    Heist: {
        name: "heist",
        time: 600,
        money: 120000000,
        strExp: 450,
        defExp: 450,
        dexExp: 450,
        agiExp: 450,
        chaExp: 450,
    },
    Homicide: {
        name: "homicide",
        time: 3,
        money: 45,
        strExp: 2,
        defExp: 2,
        dexExp: 2,
        agiExp: 2,
        chaExp: 0,
    },
    Larceny: {
        name: "larceny",
        time: 90,
        money: 800,
        strExp: 0,
        defExp: 0,
        dexExp: 60,
        agiExp: 60,
        chaExp: 0,
    },
    Kidnap: {
        name: "kidnap",
        time: 120,
        money: 3600,
        strExp: 80,
        defExp: 80,
        dexExp: 80,
        agiExp: 80,
        chaExp: 80,
    },
    Mug: {
        name: "mug",
        time: 4,
        money: 36,
        strExp: 3,
        defExp: 3,
        dexExp: 3,
        agiExp: 3,
        chaExp: 0,
    },
    RobStore: {
        name: "rob store",
        time: 60,
        money: 400,
        strExp: 0,
        defExp: 0,
        dexExp: 45,
        agiExp: 45,
        chaExp: 0,
    },
    Shoplift: {
        name: "shoplift",
        time: 2,
        money: 15,
        strExp: 0,
        defExp: 0,
        dexExp: 2,
        agiExp: 2,
        chaExp: 0,
    },
    TraffickArms: {
        name: "traffick arms",
        time: 40,
        money: 600,
        strExp: 20,
        defExp: 20,
        dexExp: 20,
        agiExp: 20,
        chaExp: 40,
    },
};

export const Programs: IPrograms = {
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
};

export const Tasks: ITasks = {
    Grow: "grow",
    Hack: "hack",
    Weaken: "weaken",
};

export const Stats: IStats = {
    Agility: "agility",
    Charisma: "charisma",
    Defense: "defense",
    Dexterity: "dexterity",
    Hacking: "hacking",
    Strength: "strength",
};

export const WorkTypes: IWorkTypes = {
    Company: "Working for Company",
    CompanyPartTime: "Working for Company part-time",
    CreateProgram: "Working on Create a Program",
    Crime: "Committing a crime",
    Factions: "Working for Faction",
    StudyClass: "Studying or Taking a class at university",
};
/* eslint-enable sort-keys */
