import { message } from "@tauri-apps/api/dialog";
import { fetch } from "@tauri-apps/api/http";
import { JSONSchema7 } from "json-schema";
import { languages } from "monaco-editor";
import { ProjectFile, ProjectFileType } from "../../MainWindow/Panels/ProjectView/ProjectFile";
import AppData from "./AppData";

import addonManifestSchema from "../../MainWindow/Schemas/addon_manifest_schema.json";
import bodySchema from "../../MainWindow/Schemas/body_schema.json";
import modManifestSchema from "../../MainWindow/Schemas/mod_manifest_schema.json";
import starSystemSchema from "../../MainWindow/Schemas/star_system_schema.json";
import translationSchema from "../../MainWindow/Schemas/translation_schema.json";
import { SettingsManager } from "./Settings";
import DiagnosticsOptions = languages.json.DiagnosticsOptions;

const schemaTypes: ProjectFileType[] = [
    "planet",
    "system",
    "translation",
    "addon_manifest",
    "mod_manifest"
];

const fallbackSchemas: { [key: string]: JSONSchema7 } = {
    planet: bodySchema as JSONSchema7,
    system: starSystemSchema as JSONSchema7,
    translation: translationSchema as JSONSchema7,
    addon_manifest: addonManifestSchema as JSONSchema7,
    mod_manifest: modManifestSchema as JSONSchema7
};

export type SchemaStore = {
    lastBranch: string;
    lastUpdated: Date;
    schemas: { [key: string]: JSONSchema7 };
};

const branch = (await SettingsManager.get()).schemaBranch;

const manager = new AppData<SchemaStore>("schema_store.json", {
    lastUpdated: new Date(),
    schemas: {},
    lastBranch: branch
});

export const getMonacoJsonDiagnostics = async (): Promise<DiagnosticsOptions> => {
    const store = await SchemaStoreManager.get();
    return {
        schemaRequest: "ignore",
        schemaValidation: "error",
        comments: "error",
        trailingCommas: "error",
        schemas: [
            {
                uri: ProjectFile.getSchemaLinkFromType("planet"),
                fileMatch: ["planets/**/*.json", "@@void@@/planets/*.json"],
                schema: store.schemas["planet"]
            },
            {
                uri: ProjectFile.getSchemaLinkFromType("system"),
                fileMatch: ["systems/**/*.json", "@@void@@/systems/*.json"],
                schema: store.schemas["system"]
            },
            {
                uri: ProjectFile.getSchemaLinkFromType("translation"),
                fileMatch: ["translations/**/*.json", "@@void@@/translations/*.json"],
                schema: store.schemas["translation"]
            },
            {
                uri: ProjectFile.getSchemaLinkFromType("addon_manifest"),
                fileMatch: ["addon-manifest.json"],
                schema: store.schemas["addon_manifest"]
            },
            {
                uri: ProjectFile.getSchemaLinkFromType("mod_manifest"),
                fileMatch: ["manifest.json"],
                schema: store.schemas["mod_manifest"]
            }
        ]
    };
};

export default class SchemaStoreManager {
    static async fetchSchema(type: ProjectFileType): Promise<JSONSchema7> {
        console.debug(`Fetching schema ${ProjectFile.getSchemaLinkFromType(type, branch)}`);
        const response = await fetch<JSONSchema7>(ProjectFile.getSchemaLinkFromType(type, branch));
        if (response.ok) {
            return response.data;
        } else {
            await message(
                `Couldn't Fetch Schema For ${type} (${response.status}), resorting to fallback schema (it might be outdated!)`,
                {
                    type: "error",
                    title: "Schema Error"
                }
            );
            return fallbackSchemas[type];
        }
    }

    static async getSchema(store: SchemaStore, type: ProjectFileType): Promise<JSONSchema7> {
        if (store.schemas[type]) {
            return store.schemas[type];
        } else {
            const schema = await SchemaStoreManager.fetchSchema(type);
            store.schemas[type] = schema;
            return schema;
        }
    }

    static async get(): Promise<SchemaStore> {
        const currentStore = await manager.get();
        // Check if the store is on a different branch or if it is outdated (has one day passed since last update)
        if (
            currentStore.lastBranch !== branch ||
            new Date().getTime() - new Date(currentStore.lastUpdated).getTime() >
                1000 * 60 * 60 * 24
        ) {
            await manager.reset();
            return await SchemaStoreManager.get();
        }
        const newStore: SchemaStore = { ...currentStore };
        for (const type of schemaTypes) {
            newStore.schemas[type] = await SchemaStoreManager.getSchema(currentStore, type);
        }
        await manager.save(newStore);
        return newStore;
    }

    static async reset() {
        await manager.reset();
    }
}
