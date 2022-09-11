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
import projectSettingsSchema from "../ProjectSettingsSchema.json";
import {
    getModManifestSchemaLink,
    getSchemaLinkForNHConfig
} from "../../MainWindow/Store/FileUtils";
import AppData from "./AppData";
import DiagnosticsOptions = monaco.languages.json.DiagnosticsOptions;

const schemaTypes = [
    "body_schema.json",
    "star_system_schema.json",
    "translation_schema.json",
    "addon_manifest_schema.json",
    "manifest_schema.json",
    "shiplog_schema.xsd",
    "text_schema.xsd",
    "dialogue_schema.xsd",
    "project_settings_schema.json"
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

export type SchemaEntry = JSONSchema7 | string;

export type SchemaRegistry = { [key: string]: SchemaEntry };

export type SchemaBranch = {
    lastUpdated: Date;
    schemas: SchemaRegistry;
};

export type SchemaStore = {
    branches: { [key: string]: SchemaBranch };
};

const manager = new AppData<SchemaStore>("schema_store.json", { branches: {} });

export const getMonacoJsonDiagnostics = async (branch: string): Promise<DiagnosticsOptions> => {
    const schemas = await SchemaStoreManager.getBranch(branch);
    return {
        schemaRequest: "ignore",
        schemaValidation: "error",
        comments: "error",
        trailingCommas: "error",
        schemas: [
            {
                uri: getSchemaLinkForNHConfig("body_schema.json", branch),
                fileMatch: ["planets/**/*.json", "@@void@@/planets/*.json"],
                schema: schemas["body_schema.json"]
            },
            {
                uri: getSchemaLinkForNHConfig("star_system_schema.json", branch),
                fileMatch: ["systems/**/*.json", "@@void@@/systems/*.json"],
                schema: schemas["star_system_schema.json"]
            },
            {
                uri: getSchemaLinkForNHConfig("translation_schema.json", branch),
                fileMatch: ["translations/**/*.json", "@@void@@/translations/*.json"],
                schema: schemas["translation_schema.json"]
            },
            {
                uri: getSchemaLinkForNHConfig("addon_manifest_schema.json", branch),
                fileMatch: ["addon-manifest.json"],
                schema: schemas["addon_manifest_schema.json"]
            },
            {
                uri: getModManifestSchemaLink(),
                fileMatch: ["manifest.json"],
                schema: schemas["manifest_schema.json"]
            },
            {
                uri: "#/project_settings_schema.json",
                fileMatch: ["nh_proj.json"],
                schema: projectSettingsSchema
            }
        ]
    };
};

export default class SchemaStoreManager {
    private static async fetchSchema<T>(name: string, xsd: boolean, branch: string): Promise<T> {
        console.debug(`Fetching schema: ${name}`);
        if (name === "project_settings_schema.json") {
            return projectSettingsSchema as unknown as T;
        }
        const link =
            name === "manifest_schema.json"
                ? getModManifestSchemaLink()
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

    private static async fetchBranch(store: SchemaStore, branch: string) {
        const schemas = await Promise.all(
            schemaTypes.map(async (name) => {
                const xsd = name.endsWith(".xsd");
                const schema = await SchemaStoreManager.fetchSchema(name, xsd, branch);
                return { [name]: schema };
            })
        );
        store.branches[branch] = {
            lastUpdated: new Date(),
            schemas: Object.assign({}, ...schemas)
        };
        await manager.save(store);
        return store.branches[branch].schemas;
    }

    static async getBranch(branch: string): Promise<SchemaRegistry> {
        let store = await manager.get();
        // Older versions of the schema store don't have a branches object
        // so, we need to migrate them
        if (!store.branches) {
            await manager.reset();
            store = await manager.getDefaultState();
        }
        const branchStore = store.branches[branch];
        if (
            !branchStore ||
            new Date().getTime() - new Date(branchStore.lastUpdated).getTime() > 86400000 // <- 1 day
        ) {
            return SchemaStoreManager.fetchBranch(store, branch);
        } else {
            return store.branches[branch].schemas;
        }
    }

    static async reset() {
        await manager.reset();
    }
}
