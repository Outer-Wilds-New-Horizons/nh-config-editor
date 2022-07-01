import {ask, save} from "@tauri-apps/api/dialog";
import {invoke} from "@tauri-apps/api/tauri";
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
import {CommonProps} from "../../App";

type JSONObject = {
    [key: string]: string | boolean | number | JSONObject;
}

export type ProjectFileType =
    "planet" |
    "system" |
    "translation" |
    "addon_manifest" |
    "mod_manifest" |
    "asset_bundle" |
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
    data: object | null = null;
    changed = false;

    static async createNew(props: CommonProps, name: string, fileType: ProjectFileType): Promise<void> {
        const newFile = new ProjectFile(false, [], name, "", fileType);
        newFile.path = `@@void@@/${newFile.getRootDirName()}/${name}`;
        newFile.setChanged(true);
        newFile.data = {};
        props.setOpenFiles([...props.openFiles, newFile]);
        props.setSelectedFile(newFile);
    }

    constructor(isFolder: boolean, children: ProjectFile[], name: string, path: string, fileType: ProjectFileType) {
        this.isFolder = isFolder;
        this.children = children;
        this.name = name;
        this.path = path;
        this.fileType = fileType;
    }

    setChanged: CallableFunction = () => {
        return;
    };

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
            case "asset_bundle":
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

    canSave(): boolean {
        return this.isJson() && this.data !== null;
    }

    isJson(): boolean {
        return this.fileType === "planet" ||
            this.fileType === "system" ||
            this.fileType === "translation" ||
            this.fileType === "addon_manifest" ||
            this.fileType === "mod_manifest";
    }

    getRootDirName(): string {
        switch (this.fileType) {
            case "planet":
                return "planets";
            case "system":
                return "systems";
            case "translation":
                return "translations";
            default:
                return "";
        }
    }

    getSchemaLink(): string {
        switch (this.fileType) {
            case "planet":
                return "https://raw.githubusercontent.com/xen-42/outer-wilds-new-horizons/main/NewHorizons/Schemas/body_schema.json";
            case "system":
                return "https://raw.githubusercontent.com/xen-42/outer-wilds-new-horizons/main/NewHorizons/Schemas/star_system_schema.json";
            case "translation":
                return "https://raw.githubusercontent.com/xen-42/outer-wilds-new-horizons/main/NewHorizons/Schemas/translation_schema.json";
            case "addon_manifest":
                return "https://raw.githubusercontent.com/xen-42/outer-wilds-new-horizons/main/NewHorizons/Schemas/addon_manifest_schema.json";
            case "mod_manifest":
                return "https://raw.githubusercontent.com/amazingalek/owml/master/schemas/manifest_schema.json";
            default:
                return "";
        }
    }

    getContentToSave(minify: boolean): string {

        if (this.isJson()) {
            const dataToSave: JSONObject = new Object(this.data) as JSONObject;

            if (!minify) dataToSave["$schema"] = this.getSchemaLink();

            if (minify) {
                return JSON.stringify(dataToSave);
            } else {
                return JSON.stringify(dataToSave, null, 4);
            }
        } else {
            return "";
        }

    }

    open(props: CommonProps): void {
        const check = props.openFiles.filter(f => f.path === this.path,);
        if (check.length === 0) {
            props.setOpenFiles(props.openFiles.concat([this]));
        }
        props.setSelectedFile(this);
    }

    close(props: CommonProps): void {
        if (this.changed) {
            ask("Are you sure you want to close this file without saving?", "Confirm").then((result) => {
                if (result) {
                    this.forceClose(props);
                }
            });
        } else {
            this.forceClose(props);
        }
    }

    forceClose(props: CommonProps): void {
        const newFiles = props.openFiles.filter(file => file !== this);
        if (newFiles.length === 0) {
            props.setSelectedFile(null);
        } else if (props.selectedFile === this) {
            props.setSelectedFile(newFiles[0]);
        }
        props.setOpenFiles(newFiles);
    }

    async saveAs(props: CommonProps) {

        const path: string | null = await save({
            title: "Save as",
            filters: [
                {name: "JSON file", extensions: ["json"]},
            ],
            defaultPath: `${props.projectPath}/${this.getRootDirName()}/${this.name}`,
        });

        if (path !== null) {
            this.path = path;
            this.name = (await invoke("get_metadata", {path: this.path}) as string[])[0];
            await this.save(props);
            props.currentlyRegisteredFiles[path] = this;
            props.invalidateFileSystem.current();
        }
    }

    async save(props: CommonProps): Promise<void> {
        if (this.path.startsWith("@@void@@/")) {
            await this.saveAs(props);
        } else if (this.canSave()) {
            await invoke("write_string_to_file", {path: this.path, content: this.getContentToSave(false)});
            this.setChanged(false);
        }
    }

}