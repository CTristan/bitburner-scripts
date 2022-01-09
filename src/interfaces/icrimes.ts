export interface ICrimes {
    [key: string]: ICrime;
    Heist: { name: string; time: number };
    Assassination: { name: string; time: number };
    Kidnap: { name: string; time: number };
    GrandTheftAuto: { name: string; time: number };
    Homicide: { name: string; time: number };
    TraffickArms: { name: string; time: number };
    BondForgery: { name: string; time: number };
    DealDrugs: { name: string; time: number };
    Mug: { name: string; time: number };
    Larceny: { name: string; time: number };
    Shoplift: { name: string; time: number };
    RobStore: { name: string; time: number };
}

interface ICrime {
    name: string;
    time: number;
}
