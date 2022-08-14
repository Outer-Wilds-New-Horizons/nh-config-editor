import { sep } from "@tauri-apps/api/path";
import { JSONPath } from "jsonpath-plus";
import { tauriCommands } from "../../Common/TauriCommands";
import { ValidationContext, ValidationError, ValidationRule } from "./Validator";

export const fileMustExistRule = <T extends object>(
    propPath: string,
    folders: "allow" | "disallow" | "force" = "disallow"
): ValidationRule<T> => ({
    perform: async (config: T, context: ValidationContext) => {
        const hits = JSONPath<{ value: string; path: string }[]>({
            path: propPath,
            json: config,
            resultType: "all"
        });
        const errors: ValidationError[] = [];
        for (const hit of hits) {
            const absPath = `${context.projectPath}${sep}${hit.value}`;
            const exists = await tauriCommands.fileExists(absPath);
            if (!exists) {
                errors.push({
                    message: `File ${hit.value} does not exist`,
                    location: hit.path
                });
                continue;
            }
            const isFolder = await tauriCommands.isDirectory(absPath);
            if (isFolder && folders === "disallow") {
                errors.push({
                    message: `${hit.value} is a folder`,
                    location: hit.path
                });
            }
            if (!isFolder && folders === "force") {
                errors.push({
                    message: `${hit.value} is not a folder`,
                    location: hit.path
                });
            }
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
});

export const minMaxRule = <T extends object>(minPath: string, maxPath: string) => {
    return {
        perform: async (config: T) => {
            const minHits = JSONPath<{ value: number; path: string }[]>({
                path: minPath,
                json: config,
                resultType: "all"
            });
            const maxHits = JSONPath<{ value: number; path: string }[]>({
                path: maxPath,
                json: config,
                resultType: "all"
            });
            const errors: ValidationError[] = [];
            for (let i = 0; i < minHits.length; i++) {
                const minHit = minHits[i];
                const maxHit = maxHits[i];
                if (minHit && maxHit) {
                    if (minHit.value > maxHit.value) {
                        errors.push({
                            message: "minimum is greater than maximum",
                            location: minHit.path
                        });
                    }
                }
            }
            return {
                valid: errors.length === 0,
                errors
            };
        }
    };
};
