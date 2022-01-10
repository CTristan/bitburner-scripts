// Bitburner-specific rule exceptions
/* eslint-disable import/no-absolute-path */
import { ICities } from '/interfaces/icities.js'
import { ICompanies } from '/interfaces/icompanies.js'
import { ICrimes } from '/interfaces/icrimes.js'
import { IFactions } from '/interfaces/ifactions.js'
import { IPrograms } from '/interfaces/iprograms.js'
import { IStats } from '/interfaces/istats.js'
import { ITasks } from '/interfaces/itasks.js'
import { IWorkTypes } from '/interfaces/iworktypes.js'

export const Factions: IFactions = {
  // Main Quest
  CyberSec: 'CyberSec', // 18,750
  NiteSec: 'NiteSec', // 112,500
  BlackHand: 'The Black Hand', // 175,000
  BitRunners: 'BitRunners', // 1,000,000
  Daedalus: 'Daedalus', // 2,500,000

  // Side Quests
  Netburners: 'Netburners', // 12,500
  SlumSnakes: 'Slum Snakes', // 22,500
  Sector12: 'Sector-12', // 50,000
  Ishima: 'Ishima', // 50,000
  Volhaven: 'Volhaven', // 50,000
  Tetrads: 'Tetrads', // 62,500
  TianDiHui: 'Tian Di Hui', // 75,000
  Aevum: 'Aevum', // 100,000
  NewTokyo: 'New Tokyo', // 112,500
  Chongqing: 'Chongqing', // 112,500

  MegaCorp: 'MegaCorp',
  ECorp: 'ECorp',
  KuaiGong: 'KuaiGong International',
  FourSigma: 'Four Sigma',
  NWO: 'NWO',
  Blade: 'Blade Industries',
  OmniTek: 'OmniTek Incorporated',
  Bachman: 'Bachman & Associates',
  Clarke: 'Clarke Incorporated',
  Fulcrum: 'Fulcrum Secret Technologies',
  Silhouette: 'Silhouette',
  Speakers: 'Speakers for the Dead',
  DarkArmy: 'The Dark Army',
  Syndicate: 'The Syndicate',

  // Endgame

  Covenant: 'The Covenant',
  Illuminati: 'Illuminati'
}

export const Cities: ICities = {
  // Starting city
  Sector12: 'Sector-12',

  // Allied city
  Aevum: 'Aevum',

  // Other cities
  Chongqing: 'Chongqing',
  Ishima: 'Ishima',
  NewTokyo: 'New Tokyo',
  Volhaven: 'Volhaven'
}

export const Companies: ICompanies = {
  Fulcrum: { name: 'Fulcrum Technologies', repReq: 250e3 },
  KuaiGong: { name: 'KuaiGong International', repReq: 200e3 },
  Clarke: { name: 'Clarke Incorporated', repReq: 200e3 },
  FourSigma: { name: 'Four Sigma', repReq: 200e3 },
  Bachman: { name: 'Bachman & Associates', repReq: 200e3 },
  NWO: { name: 'NWO', repReq: 200e3 },
  Blade: { name: 'Blade Industries', repReq: 200e3 },
  ECorp: { name: 'ECorp', repReq: 200e3 },
  MegaCorp: { name: 'MegaCorp', repReq: 200e3 }
}

export const Crimes: ICrimes = {
  Assassination: {
    name: 'assassination',
    time: 300,
    money: 12000000,
    strExp: 300,
    defExp: 300,
    dexExp: 300,
    agiExp: 300,
    chaExp: 0
  },
  BondForgery: {
    name: 'bond forgery',
    time: 300,
    money: 4500,
    strExp: 0,
    defExp: 0,
    dexExp: 150,
    agiExp: 0,
    chaExp: 15
  },
  DealDrugs: {
    name: 'deal drugs',
    time: 10,
    money: 120,
    strExp: 0,
    defExp: 0,
    dexExp: 5,
    agiExp: 5,
    chaExp: 10
  },
  GrandTheftAuto: {
    name: 'grand theft auto',
    time: 80,
    money: 1600,
    strExp: 20,
    defExp: 20,
    dexExp: 20,
    agiExp: 80,
    chaExp: 40
  },
  Heist: {
    name: 'heist',
    time: 600,
    money: 120000000,
    strExp: 450,
    defExp: 450,
    dexExp: 450,
    agiExp: 450,
    chaExp: 450
  },
  Homicide: {
    name: 'homicide',
    time: 3,
    money: 45,
    strExp: 2,
    defExp: 2,
    dexExp: 2,
    agiExp: 2,
    chaExp: 0
  },
  Larceny: {
    name: 'larceny',
    time: 90,
    money: 800,
    strExp: 0,
    defExp: 0,
    dexExp: 60,
    agiExp: 60,
    chaExp: 0
  },
  Kidnap: {
    name: 'kidnap',
    time: 120,
    money: 3600,
    strExp: 80,
    defExp: 80,
    dexExp: 80,
    agiExp: 80,
    chaExp: 80
  },
  Mug: {
    name: 'mug',
    time: 4,
    money: 36,
    strExp: 3,
    defExp: 3,
    dexExp: 3,
    agiExp: 3,
    chaExp: 0
  },
  RobStore: {
    name: 'rob store',
    time: 60,
    money: 400,
    strExp: 0,
    defExp: 0,
    dexExp: 45,
    agiExp: 45,
    chaExp: 0
  },
  Shoplift: {
    name: 'shoplift',
    time: 2,
    money: 15,
    strExp: 0,
    defExp: 0,
    dexExp: 2,
    agiExp: 2,
    chaExp: 0
  },
  TraffickArms: {
    name: 'traffick arms',
    time: 40,
    money: 600,
    strExp: 20,
    defExp: 20,
    dexExp: 20,
    agiExp: 20,
    chaExp: 40
  }
}

export const Programs: IPrograms = {
  BruteSSH: { name: 'BruteSSH.exe', hackLevelReq: 50 },
  FTPCrack: { name: 'FTPCrack.exe', hackLevelReq: 100 },
  RelaySMTP: { name: 'relaySMTP.exe', hackLevelReq: 250 },
  HTTPWorm: { name: 'HTTPWorm.exe', hackLevelReq: 500 },
  SQLInject: { name: 'SQLInject.exe', hackLevelReq: 750 },
  DeepscanV1: { name: 'DeepscanV1.exe', hackLevelReq: 75 },
  DeepscanV2: { name: 'DeepscanV2.exe', hackLevelReq: 400 },
  AutoLink: { name: 'AutoLink.exe', hackLevelReq: 25 },
  ServerProfiler: { name: 'ServerProfiler.exe', hackLevelReq: 75 },
  Formulas: { name: 'Formulas.exe', hackLevelReq: 1000 }
}

export const Tasks: ITasks = {
  Grow: 'grow',
  Hack: 'hack',
  Weaken: 'weaken'
}

export const Stats: IStats = {
  Agility: 'agility',
  Charisma: 'charisma',
  Defense: 'defense',
  Dexterity: 'dexterity',
  Hacking: 'hacking',
  Strength: 'strength'
}

export const WorkTypes: IWorkTypes = {
  Company: 'Working for Company',
  CompanyPartTime: 'Working for Company part-time',
  CreateProgram: 'Working on Create a Program',
  Crime: 'Committing a crime',
  Factions: 'Working for Faction',
  StudyClass: 'Studying or Taking a class at university'
}
