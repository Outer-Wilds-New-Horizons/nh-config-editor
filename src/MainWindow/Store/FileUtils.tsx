import { dialog, shell } from "@tauri-apps/api";
import { sep } from "@tauri-apps/api/path";
import { ReactElement } from "react";
import {
    Box2Fill,
    BracesAsterisk,
    Bullseye,
    ChatLeftQuoteFill,
    CollectionFill,
    EggFill,
    FileEarmarkBinaryFill,
    FileEarmarkCodeFill,
    FileEarmarkFill,
    FileEarmarkImageFill,
    FileEarmarkMusicFill,
    FileEarmarkTextFill,
    FileEarmarkZipFill,
    FilePostFill,
    FolderFill,
    GearFill,
    Git,
    Github,
    Globe,
    Images,
    MarkdownFill,
    MicFill,
    SlashCircleFill,
    StickiesFill,
    Tools,
    Translate,
    TrophyFill
} from "react-bootstrap-icons";
import { SettingsManager } from "../../Common/AppData/Settings";
import { tauriCommands } from "../../Common/TauriCommands";
import { OpenFile } from "./OpenFilesSlice";
import { ProjectFile } from "./ProjectFilesSlice";

// PATH UTILS

/**
 * Returns the root directory of the given file.
 * This is the topmost folder in the relative path.
 * If there is no root directory, null is returned.
 * @param path Relative path of the file.
 * @returns Root directory of the file.
 */
export const getRootDirectory = (path: string): string | null => {
    const parts = path.split(sep);
    const potentialRoot = parts[0] === "@@void@@" ? parts[1] : parts[0];
    if (potentialRoot === path) {
        return null;
    } else {
        return potentialRoot;
    }
};

/**
 * Gets the parent directory of the given file.
 * If the file is in the root directory, / is returned.
 * @param path Relative (or absolute, idk) path of the file.
 * @returns Parent directory of the file.
 */
export const getParentDirectory = (path: string): string => {
    const parts = path.split(sep);
    if (parts.length <= 1) {
        return "/";
    } else {
        return parts.slice(0, -1).join(sep);
    }
};

export const getFileName = (path: string): string => {
    const parts = path.split(sep);
    return parts[parts.length - 1];
};

// ICONS

// Common Icons used for different kinds of files.
export const planetsIcon = () => <Globe />;
export const systemsIcon = () => <Bullseye />;
export const translationsIcon = () => <Translate />;
export const addonManifestIcon = () => <FileEarmarkTextFill />;
export const modManifestIcon = () => <FileEarmarkTextFill />;

/**
 * Returns the icon for the given file.
 * First looks at the root directory,
 * then looks at the file name,
 * then looks at the file extension,
 * finally falls back to a generic file/folder icon.
 * @param file File to get the icon for.
 * @param isFolder Whether the file is a folder.
 * @returns Icon for the given file.
 */
export const determineIcon = (file: ProjectFile | OpenFile, isFolder = false): ReactElement => {
    const rootDir = getRootDirectory(file.relativePath);

    if (!isFolder && file.extension === "json" && rootDir !== null) {
        switch (rootDir.toLowerCase()) {
            case "planets":
                return planetsIcon();
            case "systems":
                return systemsIcon();
            case "translations":
                return translationsIcon();
            case "addon_manifests":
                return addonManifestIcon();
            case "mod_manifests":
                return modManifestIcon();
        }
    }

    switch (file.name.toLowerCase()) {
        case ".github":
            return <Github />;
        case ".git":
            return <Git />;
        case ".gitignore":
            return <SlashCircleFill />;
        case "config.json":
        case "default-config.json":
            return <GearFill />;
        case "build":
            return <Tools />;
        case "voicemod":
            return <MicFill />;
        case "chert":
            return <EggFill />;
        case "icons":
            return <TrophyFill />;
        case "shiplog":
        case "shiplogs":
            return <FilePostFill />;
        case "assetbundle":
        case "assetbundles":
        case "bundles":
        case "bundle":
            return <Box2Fill />;
        case "sprites":
            return <Images />;
        case "dialogue":
        case "dialog":
            return <ChatLeftQuoteFill />;
        case "assets":
            return <StickiesFill />;
        case "slides":
            return <CollectionFill />;
        case "planets":
            return planetsIcon();
        case "systems":
            return systemsIcon();
        case "translations":
            return translationsIcon();
    }
    switch (file.extension.toLowerCase()) {
        case "dll":
        case "exe":
        case "msi":
            return <FileEarmarkBinaryFill />;
        case "zip":
            return <FileEarmarkZipFill />;
        case "md":
            return <MarkdownFill />;
        case "xml":
            return <FileEarmarkCodeFill />;
        case "json":
            return <BracesAsterisk />;
        case "png":
        case "jpg":
        case "jpeg":
            return <FileEarmarkImageFill />;
        case "wav":
        case "ogg":
        case "mp3":
            return <FileEarmarkMusicFill />;
        default:
            return isFolder ? <FolderFill /> : <FileEarmarkFill />;
    }
};

// OPENING

const imageExtensions = ["png", "jpg", "jpeg"];
const audioExtensions = ["wav", "ogg", "mp3"];
const inspectorRootDirectories = ["planets", "systems", "translations"];

export const usesInspector = (file: ProjectFile | OpenFile): boolean => {
    const rootDir = getRootDirectory(file.relativePath);
    return (
        (rootDir !== null && inspectorRootDirectories.includes(rootDir.toLowerCase())) ||
        file.name === "addon-manifest.json" ||
        file.name === "manifest.json"
    );
};

export const isImage = (file: ProjectFile | OpenFile): boolean => {
    return imageExtensions.includes(file.extension.toLowerCase());
};

export const isAudio = (file: ProjectFile | OpenFile): boolean => {
    return audioExtensions.includes(file.extension.toLowerCase());
};

export const openInExternal = (file: ProjectFile | OpenFile) => {
    shell.open(file.absolutePath).catch((e) => {
        dialog.message(`Failed to open ${file.name}: ${e}`, {
            type: "error",
            title: "Error"
        });
    });
};

export const determineOpenFunction = (
    file: ProjectFile | OpenFile
): ((path: string) => Promise<string>) => {
    if (
        imageExtensions.includes(file.extension.toLowerCase()) ||
        audioExtensions.includes(file.extension.toLowerCase())
    ) {
        return tauriCommands.loadBase64File;
    } else if (usesInspector(file)) {
        return async (path: string) => {
            const raw = await tauriCommands.readFileText(path);
            if (!(await SettingsManager.get()).alwaysUseTextEditor) {
                JSON.parse(raw);
            }
            return raw;
        };
    } else {
        return tauriCommands.readFileText;
    }
};

export const getMonacoLanguage = (file: ProjectFile | OpenFile): string => {
    switch (file.extension) {
        case "md":
            return "markdown";
        case "yml":
            return "yaml";
        default:
            return file.extension;
    }
};

export const getInitialContent = (rootDir: string) => {
    switch (rootDir) {
        case "planets":
            return JSON.stringify(
                {
                    $schema:
                        "https://raw.githubusercontent.com/xen-42/outer-wilds-new-horizons/main/NewHorizons/Schemas/body_schema.json",
                    name: "New Planet"
                },
                null,
                4
            );
        case "systems":
            return JSON.stringify(
                {
                    $schema:
                        "https://raw.githubusercontent.com/xen-42/outer-wilds-new-horizons/main/NewHorizons/Schemas/system_schema.json",
                    Vessel: null
                },
                null,
                4
            );
        case "translations":
            return JSON.stringify(
                {
                    $schema:
                        "https://raw.githubusercontent.com/xen-42/outer-wilds-new-horizons/main/NewHorizons/Schemas/translation_schema.json"
                },
                null,
                4
            );
        default:
            return "";
    }
};

// SCHEMAS

export const getSchemaName = (file: ProjectFile | OpenFile): string => {
    if (file.name === "addon-manifest.json") {
        return "addon_manifest_schema.json";
    } else if (file.name === "manifest.json") {
        return "manifest_schema.json";
    } else {
        const rootDir = getRootDirectory(file.relativePath);
        if (rootDir === "planets") {
            return "body_schema.json";
        } else if (rootDir === "systems") {
            return "star_system_schema.json";
        } else if (rootDir === "translations") {
            return "translation_schema.json";
        } else {
            return "null";
        }
    }
};

export const getSchemaLinkForNHConfig = (type: string, branch: string) =>
    `https://raw.githubusercontent.com/xen-42/outer-wilds-new-horizons/${branch}/NewHorizons/Schemas/${type}`;

export const getDocsLinkForNHConfig = (type: string) =>
    `https://nh.outerwildsmods.com/Schemas/${type.split(".")[0]}.html`;

export const getModManifestSchemaLink = (branch: string) =>
    `https://raw.githubusercontent.com/amazingalek/owml/${
        branch === "main" ? "master" : branch
    }/schemas/manifest_schema.json`;

// SAVING

export const getContentToSave = async (file: OpenFile) => {
    return file.memoryData ?? "";
};
