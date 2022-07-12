import { save } from "@tauri-apps/api/dialog";
import { sep } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/tauri";
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
import SchemaStoreManager from "../../../Common/AppData/SchemaStore";
import { SettingsManager } from "../../../Common/AppData/Settings";
import { deleteDefaultValues, deleteEmptyObjects } from "../../../Common/Utils";

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

    static async createVoid(
        name: string,
        fileType: ProjectFileType,
        extension: string
    ): Promise<ProjectFile> {
        const newFile = new ProjectFile(false, [], extension, name, "", fileType);
        newFile.path = `@@void@@${sep}${newFile.getRootDirName()}${sep}${name}`;
        newFile.changed = true;
        newFile.data = {};
        return newFile;
    }

    static getIconForFileTypeAndExtension(fileType: ProjectFileType, ext = ""): ReactElement {
        switch (fileType) {
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
                switch (ext) {
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

    getIcon(): ReactElement {
        return ProjectFile.getIconForFileTypeAndExtension(this.fileType, this.extension);
    }

    canSave(): boolean {
        return this.data !== null;
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

    static getSchemaNameFromType(fileType: ProjectFileType): string {
        switch (fileType) {
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

    static getSchemaLinkFromType(fileType: ProjectFileType, branch = "main"): string {
        if (fileType === "mod_manifest") {
            return "https://raw.githubusercontent.com/amazingalek/owml/master/schemas/manifest_schema.json";
        } else {
            return `https://raw.githubusercontent.com/xen-42/outer-wilds-new-horizons/${branch}/NewHorizons/Schemas/${ProjectFile.getSchemaNameFromType(
                fileType
            )}_schema.json`;
        }
    }

    getSchemaName(): string {
        return ProjectFile.getSchemaNameFromType(this.fileType);
    }

    getSchemaLink(branch = "main"): string {
        return ProjectFile.getSchemaLinkFromType(this.fileType, branch);
    }

    getDocsSchemaLink(): string {
        return `https://nh.outerwildsmods.com/Schemas/${this.getSchemaName()}_schema.html`;
    }

    async getContentToSave(minify: boolean): Promise<string> {
        if (typeof this.data === "string") {
            return (this.data as string | null) ?? "";
        } else {
            let dataToSave: JSONObject = new Object(this.data) as JSONObject;
            const schema = (await SchemaStoreManager.get()).schemas[this.fileType];
            deleteDefaultValues(dataToSave as { [key: string]: object }, schema, schema);
            dataToSave = deleteEmptyObjects(dataToSave) as JSONObject;
            if (!minify)
                dataToSave["$schema"] = this.getSchemaLink(
                    (await SettingsManager.get()).schemaBranch
                );
            if (minify) {
                return JSON.stringify(dataToSave);
            } else {
                return JSON.stringify(dataToSave, null, 4);
            }
        }
    }

    async saveAs(projectPath: string): Promise<string | null> {
        const path: string | null = await save({
            title: "Save as",
            filters: [{ name: "JSON file", extensions: ["json"] }],
            defaultPath: `${projectPath}${sep}${this.getRootDirName()}${sep}${this.name}`
        });

        if (path !== null) {
            this.path = path;
            this.name = ((await invoke("get_metadata", { path: this.path })) as string[])[0];
            await this.save();
        }

        return path;
    }

    async save(): Promise<void> {
        if (this.canSave()) {
            await invoke("write_string_to_file", {
                path: this.path,
                content: await this.getContentToSave(false)
            });
            this.changed = false;
        }
    }

    async delete(): Promise<void> {
        if (this.path.startsWith("@@void@@/")) {
            return;
        }
        await invoke(this.isFolder ? "delete_dir" : "delete_file", { path: this.path });
    }
}
