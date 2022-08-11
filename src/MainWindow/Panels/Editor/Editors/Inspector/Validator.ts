import { AjvError, FieldError } from "@rjsf/core";
import { prettyErrorMessage } from "../../../../../Common/Utils";

// Redefined from rjsf bc they don't export the type for literally no reason :D
type FieldValidation = {
    __errors: FieldError[];
    addError: (message: string) => void;
};

type FormValidation = FieldValidation & {
    [fieldName: string]: FieldValidation;
};

export const customFormats = {
    int32: /-?\d+/,
    float: /-?\d+\.\d+/
};

const transformErrors = (errors: AjvError[]): AjvError[] => {
    const newErrors = errors.filter((e) => e.name !== "additionalProperties");
    return newErrors.map((e) => {
        const message = prettyErrorMessage(e.message);
        return { ...e, message };
    });
};

const baseValidate = (formData: object, errors: FormValidation): FormValidation => {
    return errors;
};

export default baseValidate;
export { transformErrors };
