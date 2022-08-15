// Bare-bones planet config used only for validation
import { fileMustExistRule, minMaxRule } from "./GenericRules";
import { ValidationError } from "./Validator";

export type Planet = {
    name: string;
    starSystem: string;
    Orbit: {
        primaryBody: string;
    };
    FocalPoint: {
        primary: string;
        secondary: string;
    };
    Funnel: {
        target: string;
    };
    Props: {
        details: {
            assetBundle: string;
            quantumGroupID: string;
        }[];
        quantumGroups: {
            id: string;
        }[];
    };
    Ring: {
        texture: string;
    };
    ShipLog: {
        xmlFile: string;
        spriteFolder: string;
        mapMode: {
            outlineSprite: string;
            revealedSprite: string;
        };
    };
    Star: {
        StarRampTexture: string;
        StarCollapseRampTexture: string;
    };
};

const filePaths = [
    "$.ShipLog.xmlFile",
    "$.ShipLog.mapMode.outlineSprite",
    "$.ShipLog.mapMode.revealedSprite",
    "$.Atmosphere.clouds.capPath",
    "$.Atmosphere.clouds.rampPath",
    "$.Atmosphere.clouds.texturePath",
    "$.Props.dialogue[*].xmlFile",
    "$.Props.scatter[*].assetBundle",
    "$.Props.details[*].assetBundle",
    "$.Props.slideShows[*].slides[*].imagePath"
];

const folderPaths = ["$.ShipLog.spriteFolder"];

const minMaxPaths = [
    ["$.Props.scatter[*].minHeight", "$.Props.scatter[*].maxHeight"],
    ["$.HeightMap.minHeight", "$.HeightMap.maxHeight"]
];

const fileRules = filePaths.map((filePath) => fileMustExistRule<Planet>(filePath));
const folderRules = folderPaths.map((folderPath) => fileMustExistRule<Planet>(folderPath, "force"));
const minMaxRules = minMaxPaths.map(([minPath, maxPath]) => minMaxRule<Planet>(minPath, maxPath));

const quantumGroupRule = {
    perform: async (config: Planet) => {
        if (config.Props?.details === undefined) {
            return { valid: true, errors: [] };
        }
        const ids = (config.Props.quantumGroups ?? []).map((group) => group.id);
        const errors: ValidationError[] = [];
        for (let i = 0; i < config.Props.details.length; i++) {
            const detail = config.Props.details[i];
            if (detail.quantumGroupID !== undefined && !ids.includes(detail.quantumGroupID)) {
                errors.push({
                    message: `Quantum group ${detail.quantumGroupID} not found`,
                    location: `$.Props.details[${i}].quantumGroupID`
                });
            }
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
};

export default fileRules.concat(folderRules).concat(minMaxRules).concat([quantumGroupRule]);
