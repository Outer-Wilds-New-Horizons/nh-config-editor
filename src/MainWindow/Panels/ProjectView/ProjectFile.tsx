import { ask, save } from "@tauri-apps/api/dialog";
import { sep } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/tauri";
import { JSONSchema7 } from "json-schema";
import { ReactElement } from "react";
import {
    Box2Fill,
    BracesAsterisk,
    Bullseye,
    FileEarmarkBinaryFill,
    FileEarmarkCodeFill,
    FileEarmarkFill,
    FileEarmarkImageFill,
    FileEarmarkMusicFill,
    FileEarmarkZipFill,
    FileMedicalFill,
    Globe,
    MarkdownFill,
    Translate
} from "react-bootstrap-icons";
import { deleteDefaultValues, deleteEmptyObjects } from "../../../Common/Utils";
import { CommonProps } from "../../MainWindow";
import addonManifestSchema from "../../Schemas/addon_manifest_schema.json";
import bodySchema from "../../Schemas/body_schema.json";
import modManifestSchema from "../../Schemas/mod_manifest_schema.json";
import starSystemSchema from "../../Schemas/star_system_schema.json";
import translationSchema from "../../Schemas/translation_schema.json";

type JSONObject = {
    [key: string]: string | boolean | number | JSONObject;
};

export type ProjectFileType =
    | "planet"
    | "system"
    | "translation"
    | "addon_manifest"
    | "mod_manifest"
    | "asset_bundle"
    | "xml"
    | "image"
    | "sound"
    | "binary"
    | "other";

export class ProjectFile {
    isFolder: boolean;
    children: ProjectFile[];
    name: string;
    path: string;
    fileType: ProjectFileType;
    extension: string;
    data: object | string | null = null;
    changed = false;

    constructor(
        isFolder: boolean,
        children: ProjectFile[],
        extension: string,
        name: string,
        path: string,
        fileType: ProjectFileType
    ) {
        this.isFolder = isFolder;
        this.children = children;
        this.extension = extension;
        this.name = name;
        this.path = path;
        this.fileType = fileType;
    }

    static async createNew(
        props: CommonProps,
        name: string,
        fileType: ProjectFileType,
        extension: string
    ): Promise<void> {
        const newFile = new ProjectFile(false, [], extension, name, "", fileType);
        newFile.path = `@@void@@/${newFile.getRootDirName()}/${name}`;
        newFile.setChanged(true);
        newFile.data = {};
        props.setOpenFiles([...props.openFiles, newFile]);
        props.setSelectedFile(newFile);
    }

    setChanged: CallableFunction = () => {
        return;
    };

    getIcon(): ReactElement {
        switch (this.fileType) {
            case "planet":
                return <Globe />;
            case "system":
                return <Bullseye />;
            case "translation":
                return <Translate />;
            case "addon_manifest":
                return <FileMedicalFill />;
            case "mod_manifest":
                return <FileMedicalFill />;
            case "asset_bundle":
                return <Box2Fill />;
            case "image":
                return <FileEarmarkImageFill />;
            case "sound":
                return <FileEarmarkMusicFill />;
            case "binary":
                return <FileEarmarkBinaryFill />;
            default:
                switch (this.extension) {
                    case "zip":
                        return <FileEarmarkZipFill />;
                    case "md":
                        return <MarkdownFill />;
                    case "xml":
                        return <FileEarmarkCodeFill />;
                    case "json":
                        return <BracesAsterisk />;
                    default:
                        return <FileEarmarkFill />;
                }
        }
    }

    canSave(): boolean {
        return this.data !== null;
    }

    isJson(): boolean {
        return (
            this.fileType === "planet" ||
            this.fileType === "system" ||
            this.fileType === "translation" ||
            this.fileType === "addon_manifest" ||
            this.fileType === "mod_manifest"
        );
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

    getSchema(): JSONSchema7 {
        switch (this.fileType) {
            case "planet":
                return bodySchema as JSONSchema7;
            case "system":
                return starSystemSchema as JSONSchema7;
            case "translation":
                return translationSchema as JSONSchema7;
            case "addon_manifest":
                return addonManifestSchema as JSONSchema7;
            case "mod_manifest":
                return modManifestSchema as JSONSchema7;
            default:
                return { type: "null" };
        }
    }

    getMonacoLanguage(): string {
        switch (this.extension) {
            case "md":
                return "markdown";
            case "yml":
                return "yaml";
            default:
                return this.extension;
        }
    }

    getSchemaName(): string {
        switch (this.fileType) {
            case "planet":
                return "body";
            case "system":
                return "star_system";
            case "translation":
                return "translation";
            case "addon_manifest":
                return "addon_manifest";
            case "mod_manifest":
                return "manifest";
            default:
                return "";
        }
    }

    getSchemaLink(): string {
        return `https://raw.githubusercontent.com/xen-42/outer-wilds-new-horizons/main/NewHorizons/Schemas/${this.getSchemaName()}_schema.json`;
    }

    getDocsSchemaLink(): string {
        return `https://nh.outerwildsmods.com/Schemas/${this.getSchemaName()}_schema.html`;
    }

    getContentToSave(minify: boolean): string {
        if (typeof this.data === "string") {
            console.log(this.data);
            return (this.data as string | null) ?? "";
        } else {
            let dataToSave: JSONObject = new Object(this.data) as JSONObject;
            deleteDefaultValues(
                dataToSave as { [key: string]: object },
                this.getSchema(),
                this.getSchema()
            );
            dataToSave = deleteEmptyObjects(dataToSave) as JSONObject;
            if (!minify) dataToSave["$schema"] = this.getSchemaLink();
            if (minify) {
                return JSON.stringify(dataToSave);
            } else {
                return JSON.stringify(dataToSave, null, 4);
            }
        }
    }

    open(props: CommonProps): void {
        const check = props.openFiles.filter((f) => f.path === this.path);
        if (check.length === 0) {
            props.setOpenFiles(props.openFiles.concat([this]));
        }
        props.setSelectedFile(this);
    }

    close(props: CommonProps): void {
        if (this.changed) {
            ask("Are you sure you want to close this file without saving?", this.name).then(
                (result) => {
                    if (result) {
                        this.forceClose(props);
                    }
                }
            );
        } else {
            this.forceClose(props);
        }
    }

    forceClose(props: CommonProps): void {
        const newFiles = props.openFiles.filter((file) => file !== this);
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
            filters: [{ name: "JSON file", extensions: ["json"] }],
            defaultPath: `${props.project.path}${sep}${this.getRootDirName()}${sep}${this.name}`
        });

        if (path !== null) {
            this.path = path;
            this.name = ((await invoke("get_metadata", { path: this.path })) as string[])[0];
            await this.save(props);
            props.currentlyRegisteredFiles[path] = this;
            props.invalidateFileSystem.current();
        }
    }

    async save(props: CommonProps): Promise<void> {
        if (this.path.startsWith("@@void@@/")) {
            await this.saveAs(props);
        } else if (this.canSave()) {
            await invoke("write_string_to_file", {
                path: this.path,
                content: this.getContentToSave(false)
            });
            this.setChanged(false);
        }
    }
}
