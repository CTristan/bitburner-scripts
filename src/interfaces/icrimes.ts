import { ICrime } from './icrime';

export interface ICrimes {
  [key: string]: ICrime;
  Assassination: ICrime;
  BondForgery: ICrime;
  DealDrugs: ICrime;
  GrandTheftAuto: ICrime;
  Heist: ICrime;
  Homicide: ICrime;
  Kidnap: ICrime;
  Larceny: ICrime;
  Mug: ICrime;
  RobStore: ICrime;
  Shoplift: ICrime;
  TraffickArms: ICrime;
}
