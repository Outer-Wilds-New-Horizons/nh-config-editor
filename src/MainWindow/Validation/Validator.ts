import { getFileName, getRootDirectory } from "../Store/FileUtils";
import { OpenFile } from "../Store/OpenFilesSlice";
import manifestRules from "./ManifestValidator";
import planetRules from "./PlanetValidator";

export type ValidationResult = {
    valid: boolean;
    errors: ValidationError[];
};

export type ValidationRule<T> = {
    perform: (config: T, context: ValidationContext) => Promise<ValidationResult>;
};

export type ValidationError = {
    message: string;
    location: string;
};

export type ValidationContext = {
    projectPath: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const determineValidationRules = (configPath: string): ValidationRule<any>[] => {
    const filename = getFileName(configPath);
    const rootDir = getRootDirectory(configPath);
    if (filename === "manifest.json") {
        return manifestRules;
    }
    if (rootDir === "planets") {
        return planetRules;
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
    let errors: ValidationError[] = [];
    for (const rule of rules) {
        const result = await rule.perform(config, context);
        if (!result.valid) {
            errors = errors.concat(result.errors);
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
