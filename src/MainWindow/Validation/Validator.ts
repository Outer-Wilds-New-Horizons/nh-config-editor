import { getFileName } from "../Store/FileUtils";
import { OpenFile } from "../Store/OpenFilesSlice";
import manifestRules from "./ManifestValidator";

export type ValidationResult = {
    valid: boolean;
    error: ValidationError;
};

export type ValidationRule<T> = {
    id: string;
    perform: (config: T, context: ValidationContext) => Promise<ValidationResult>;
};

export type ValidationError = {
    id: string;
    message: string;
    location: string;
};

export type ValidationContext = {
    projectPath: string;
};

const determineValidationRules = (configPath: string) => {
    const filename = getFileName(configPath);
    if (filename === "manifest.json") {
        return manifestRules;
    }
    return [];
};

const validateWithRules = async <T>(
    configRaw: string,
    rules: ValidationRule<T>[],
    context: ValidationContext
) => {
    if (rules.length === 0) return [];
    const config = JSON.parse(configRaw);
    const errors: ValidationError[] = [];
    for (const rule of rules) {
        const result = await rule.perform(config, context);
        if (!result.valid) {
            errors.push(result.error);
        }
    }
    return errors;
};

const validate = async (content: string, file: OpenFile) => {
    const context: ValidationContext = {
        projectPath: file.absolutePath.replace(file.relativePath, "")
    };
    const rules = determineValidationRules(file.relativePath);
    return await validateWithRules(content, rules, context);
};

export default validate;
