import { NS } from "@ns";
import { forceRunScript } from "./scripts/utils";

export async function main(ns: NS): Promise<void> {
    ns.exec("/scripts/hack-the-planet.js", "home", 1, true);
    forceRunScript(ns, "/scripts/singularity/travel-to-most-needed-city.js");
}
