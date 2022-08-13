import { sep } from "@tauri-apps/api/path";
import { JSONPath } from "jsonpath-plus";
import { tauriCommands } from "../../Common/TauriCommands";
import { ValidationContext, ValidationRule } from "./Validator";

export function fileMustExistRule<T extends object>(
    id: string,
    propPath: string
): ValidationRule<T> {
    return {
        id,
        perform: async (config: T, context: ValidationContext) => {
            const path = JSONPath({ path: propPath, json: config });
            const exists = await tauriCommands.fileExists(`${context.projectPath}${sep}${path}`);
            return {
                valid: exists,
                error: {
                    id,
                    message: `File not found: ${path}`,
                    location: propPath
                }
            };
        }
    };
}
