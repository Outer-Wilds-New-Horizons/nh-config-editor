import { AjvError } from "@rjsf/core";
import { JSONPath } from "jsonpath-plus";
import { prettyErrorMessage } from "../../../../../Common/Utils";
import { ValidationError } from "../../../../Validation/Validator";

export const customFormats = {
    int32: /-?\d+/,
    float: /-?\d+\.\d+/
};

export const validationErrorsToErrorSchema = (errors: ValidationError[]) => {
    // Transforms validation errors list to an error schema for rjsf
    // Based on the function they use to turn AJV errors into an error schema
    if (!errors.length) {
        return {};
    }
    return errors.reduce((errorSchema, error) => {
        const message = error.message;
        const path = JSONPath.toPathArray(error.location.slice(1));
        console.debug(`Adding error ${message} at ${path}`);
        let parent = errorSchema as Record<string, unknown>;

        if (path.length > 0 && path[0] === "") {
            path.splice(0, 1);
        }

        for (const segment of path.slice(0)) {
            if (!(segment in parent)) {
                parent[segment] = {};
            }
            parent = parent[segment] as Record<string, object>;
        }

        if (Array.isArray(parent.__errors)) {
            parent.__errors = parent.__errors.concat(message);
        } else {
            if (message) {
                parent.__errors = [message];
            }
        }
        return errorSchema;
    }, {});
};

const transformErrors = (errors: AjvError[]): AjvError[] => {
    const newErrors = errors.filter(
        (e) => e.name !== "additionalProperties" && !e.message.includes("should be object")
    );
    return newErrors.map((e) => {
        const message = prettyErrorMessage(e.message);
        return { ...e, message };
    });
};

export { transformErrors };
