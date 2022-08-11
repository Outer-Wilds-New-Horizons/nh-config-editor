import { message } from "@tauri-apps/api/dialog";
import { fetch } from "@tauri-apps/api/http";
import { JSONSchema7 } from "json-schema";
import * as monaco from "monaco-editor";

import addonManifestSchema from "../../MainWindow/Schemas/addon_manifest_schema.json";
import bodySchema from "../../MainWindow/Schemas/body_schema.json";
import dialogueSchema from "../../MainWindow/Schemas/dialogue_schema.xsd";
import modManifestSchema from "../../MainWindow/Schemas/mod_manifest_schema.json";
import shiplogSchema from "../../MainWindow/Schemas/shiplog_schema.xsd";
import starSystemSchema from "../../MainWindow/Schemas/star_system_schema.json";
import text_schema from "../../MainWindow/Schemas/text_schema.xsd";
import translationSchema from "../../MainWindow/Schemas/translation_schema.json";
import {
    getModManifestSchemaLink,
    getSchemaLinkForNHConfig
} from "../../MainWindow/Store/FileUtils";
import AppData from "./AppData";
import { SettingsManager } from "./Settings";
import DiagnosticsOptions = monaco.languages.json.DiagnosticsOptions;

const schemaTypes = [
    "body_schema.json",
    "star_system_schema.json",
    "translation_schema.json",
    "addon_manifest_schema.json",
    "manifest_schema.json",
    "shiplog_schema.xsd",
    "text_schema.xsd",
    "dialogue_schema.xsd"
];

export const fallbackSchemas: { [key: string]: JSONSchema7 | string } = {
    "body_schema.json": bodySchema as JSONSchema7,
    "star_system_schema.json": starSystemSchema as JSONSchema7,
    "addon_manifest_schema.json": addonManifestSchema as JSONSchema7,
    "manifest_schema.json": modManifestSchema as JSONSchema7,
    "translation_schema.json": translationSchema as JSONSchema7,
    "dialogue_schema.xsd": dialogueSchema,
    "shiplog_schema.xsd": shiplogSchema,
    "text_schema.xsd": text_schema
};

export type SchemaStore = {
    lastBranch: string;
    lastUpdated: Date;
    schemas: { [key: string]: JSONSchema7 | string };
};

const manager = new AppData<SchemaStore>("schema_store.json", async () => ({
    lastUpdated: new Date(),
    schemas: {},
    lastBranch: (await SettingsManager.get()).schemaBranch
}));

export const getMonacoJsonDiagnostics = async (): Promise<DiagnosticsOptions> => {
    const store = await SchemaStoreManager.get();
    const branch = (await SettingsManager.get()).schemaBranch;
    return {
        schemaRequest: "ignore",
        schemaValidation: "error",
        comments: "error",
        trailingCommas: "error",
        schemas: [
            {
                uri: getSchemaLinkForNHConfig("planet_schema.json", branch),
                fileMatch: ["planets/**/*.json", "@@void@@/planets/*.json"],
                schema: store.schemas["planet"]
            },
            {
                uri: getSchemaLinkForNHConfig("star_system_schema.json", branch),
                fileMatch: ["systems/**/*.json", "@@void@@/systems/*.json"],
                schema: store.schemas["system"]
            },
            {
                uri: getSchemaLinkForNHConfig("translation_schema.json", branch),
                fileMatch: ["translations/**/*.json", "@@void@@/translations/*.json"],
                schema: store.schemas["translation"]
            },
            {
                uri: getSchemaLinkForNHConfig("addon_manifest_schema.json", branch),
                fileMatch: ["addon-manifest.json"],
                schema: store.schemas["addon_manifest"]
            },
            {
                uri: getSchemaLinkForNHConfig("mod_manifest_schema.json", branch),
                fileMatch: ["manifest.json"],
                schema: store.schemas["mod_manifest"]
            }
        ]
    };
};

export default class SchemaStoreManager {
    static async fetchSchema<T>(name: string, xsd: boolean, branch: string): Promise<T> {
        console.debug(`Fetching schema: ${name}`);
        const link =
            name === "manifest_schema.json"
                ? getModManifestSchemaLink(branch)
                : getSchemaLinkForNHConfig(name, branch);
        const response = await fetch<T>(link, {
            method: "GET",
            responseType: xsd ? 2 : 1
        });
        if (response.ok) {
            return response.data as T;
        } else {
            await message(
                `Couldn't Fetch Schema ${name} (${response.status}), resorting to fallback schema (it might be outdated!)`,
                {
                    type: "error",
                    title: "Schema Error"
                }
            );
            return fallbackSchemas[name] as T;
        }
    }

    static async getSchema<T>(
        store: SchemaStore,
        name: string,
        xsd: boolean,
        branch: string
    ): Promise<T> {
        if (store.schemas[name]) {
            return store.schemas[name] as T;
        } else {
            return await SchemaStoreManager.fetchSchema<T>(name, xsd, branch);
        }
    }

    static async get(): Promise<SchemaStore> {
        const currentStore = await manager.get();
        const branch = (await SettingsManager.get()).schemaBranch;
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
        for (const name of schemaTypes) {
            newStore.schemas[name] = await SchemaStoreManager.getSchema(
                currentStore,
                name,
                name.endsWith(".xsd"),
                branch
            );
        }
        await manager.save(newStore);
        return newStore;
    }

    static async reset() {
        await manager.reset();
    }
}
