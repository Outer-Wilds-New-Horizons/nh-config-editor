import { fileMustExistRule } from "./GenericRules";
import { ValidationRule } from "./Validator";

type Manifest = {
    dllPath: string;
};

const checkForDLL: ValidationRule<Manifest> = fileMustExistRule<Manifest>("$.filename");

export default [checkForDLL];
