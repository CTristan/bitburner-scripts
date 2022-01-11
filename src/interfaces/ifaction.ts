export interface IFaction {
  [key: string]: string | string[];
  name: string;
  cities: string[];
  enemies: string[];
}
