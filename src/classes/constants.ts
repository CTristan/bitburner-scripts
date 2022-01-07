export class Constants {
    Companies = [
        { name: "Fulcrum Technologies", repReq: 250e3 },
        { name: "KuaiGong International", repReq: 200e3 },
        { name: "Clarke Incorporated", repReq: 200e3 },
        { name: "Four Sigma", repReq: 200e3 },
        { name: "Bachman & Associates", repReq: 200e3 },
        { name: "NWO", repReq: 200e3 },
        { name: "Blade Industries", repReq: 200e3 },
        { name: "ECorp", repReq: 200e3 },
        { name: "MegaCorp", repReq: 200e3 },
    ]

    Factions = [
        // Main Quest
        "CyberSec", // 18,750
        "NiteSec", // 112,500
        "The Black Hand", // 175000

        "BitRunners",

        // Side Quests
        "Netburners", // 12,500
        "Slum Snakes", // 22,500
        "Sector-12", // 50,000
        "Volhaven", // 50,000
        "Ishima", // 50,000
        "Tetrads", // 62,500
        "Tian Di Hui", // 75,000
        "Aevum", // 100,000
        "New Tokyo", // 112,500
        "Chongqing", // 112,500

        "MegaCorp",
        "ECorp",
        "KuaiGong International",
        "Four Sigma",
        "NWO",
        "Blade Industries",
        "OmniTek Incorporated",
        "Bachman & Associates",
        "Clarke Incorporated",
        "Fulcrum Secret Technologies",
        "Silhouette",
        "Speakers for the Dead",
        "The Dark Army",
        "The Syndicate",
    ]

    Programs = [
        { name: "BruteSSH.exe", hackLevelReq: 50 },
        { name: "FTPCrack.exe", hackLevelReq: 100 },
        { name: "relaySMTP.exe", hackLevelReq: 250 },
        { name: "HTTPWorm.exe", hackLevelReq: 500 },
        { name: "SQLInject.exe", hackLevelReq: 750 },
        { name: "DeepscanV1.exe", hackLevelReq: 75 },
        { name: "DeepscanV2.exe", hackLevelReq: 400 },
        { name: "AutoLink.exe", hackLevelReq: 25 },
        { name: "ServerProfiler.exe", hackLevelReq: 75 },
    ]

    WorkTypes = {
        Company: "Working for Company",
        CompanyPartTime: "Working for Company part-time",
        CreateProgram: "Working on Create a Program",
        Crime: "Committing a crime",
        Factions: "Working for Faction",
        StudyClass: "Studying or Taking a class at university",
    }
}
