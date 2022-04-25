import { NS } from "@ns"

// eslint-disable-next-line require-await
export async function main(ns: NS): Promise<void> {
    ns.exec("hack-the-planet.js", "home", 1, true)
}
