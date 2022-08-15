import { fileMustExistRule } from "./GenericRules";

const filePaths = [
    "$.Skybox.rightPath",
    "$.Skybox.leftPath",
    "$.Skybox.topPath",
    "$.Skybox.bottomPath",
    "$.Skybox.frontPath",
    "$.Skybox.backPath"
];

const fileRules = filePaths.map((filePath) => fileMustExistRule<Record<string, never>>(filePath));

export default fileRules;
