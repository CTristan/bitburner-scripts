import { NS } from "@ns"

export async function main(ns: NS): Promise<void> {
    ns.exec("/scripts/hack-the-planet.js", "home", 1, true)
    ns.exit()
}
