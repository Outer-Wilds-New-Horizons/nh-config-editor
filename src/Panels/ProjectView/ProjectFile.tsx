import {ReactElement} from "react";
import {
    Box2Fill,
    Bullseye,
    FileEarmarkBinaryFill,
    FileEarmarkCodeFill,
    FileEarmarkFill,
    FileEarmarkImageFill,
    FileEarmarkMusicFill,
    FileMedicalFill,
    Globe,
    Translate
} from "react-bootstrap-icons";

export type ProjectFileType =
    "planet" |
    "system" |
    "translation" |
    "addon_manifest" |
    "mod_manifest" |
    "asset-bundle" |
    "xml" |
    "image" |
    "sound" |
    "binary" |
    "other";

export class ProjectFile {

    isFolder: boolean;
    children: ProjectFile[];
    name: string;
    path: string;
    fileType: ProjectFileType;

    constructor(isFolder: boolean, children: ProjectFile[], name: string, path: string, fileType: ProjectFileType) {
        this.isFolder = isFolder;
        this.children = children;
        this.name = name;
        this.path = path;
        this.fileType = fileType;
    }

    getIcon(): ReactElement {
        switch (this.fileType) {
            case "planet":
                return <Globe/>;
            case "system":
                return <Bullseye/>;
            case "translation":
                return <Translate/>;
            case "addon_manifest":
                return <FileMedicalFill/>;
            case "mod_manifest":
                return <FileMedicalFill/>;
            case "asset-bundle":
                return <Box2Fill/>;
            case "xml":
                return <FileEarmarkCodeFill/>;
            case "image":
                return <FileEarmarkImageFill/>;
            case "sound":
                return <FileEarmarkMusicFill/>;
            case "binary":
                return <FileEarmarkBinaryFill/>;
            default:
                return <FileEarmarkFill/>;
        }
    }

}