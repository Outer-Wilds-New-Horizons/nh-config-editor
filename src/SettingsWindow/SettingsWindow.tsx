import Form, { UiSchema } from "@rjsf/core";
import { ask, message } from "@tauri-apps/api/dialog";
import { emit } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { getAll, WebviewWindow } from "@tauri-apps/api/window";
import { JSONSchema7 } from "json-schema";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { SettingsManager } from "../Common/AppData/Settings";

import settingsSchema from "../Common/AppData/SettingsSchema.json";
import InspectorBoolean from "../MainWindow/Panels/Editor/Editors/Inspector/Fields/InspectorBoolean";
import InspectorArrayFieldTemplate from "../MainWindow/Panels/Editor/Editors/Inspector/FieldTemplates/InspectorArrayFieldTemplate";
import InspectorFieldTemplate from "../MainWindow/Panels/Editor/Editors/Inspector/FieldTemplates/InspectorFieldTemplate";
import InspectorObjectFieldTemplate from "../MainWindow/Panels/Editor/Editors/Inspector/FieldTemplates/InspectorObjectFieldTemplate";

export const openSettingsWindow = () => {
    const webview = new WebviewWindow("settings", {
        title: "Settings",
        width: 700,
        height: 600,
        resizable: false,
        url: "index.html#SETTINGS"
    });

    webview.once("tauri://created", () => {
        getAll()
            .find((w) => w.label === "new_project")
            ?.close();
    });
};

const initialSettings = await SettingsManager.get();

function SettingsWindow() {
    const [settings, setSettings] = useState(initialSettings);

    const customFields = {
        BooleanField: InspectorBoolean
    };

    const uiSchema: UiSchema = {
        "ui:submitButtonOptions": {
            norender: true,
            submitText: "",
            props: {}
        }
    };

    const close = () => {
        getAll()
            .find((w) => w.label === "settings")
            ?.close();
    };

    const onSave = async () => {
        if (
            !(await invoke("file_exists", { path: settings.defaultProjectFolder })) ||
            !(await invoke("is_dir", { path: settings.defaultProjectFolder }))
        ) {
            await message("defaultProjectFolder is invalid, Please enter a path to a folder", {
                type: "warning",
                title: "Invalid Path"
            });
            return;
        }

        await SettingsManager.save(settings);
        await emit("nh://settings-changed", settings);

        const themeChanged = settings.theme !== initialSettings.theme;
        const alwaysUseTextEditorChanged =
            settings.alwaysUseTextEditor !== initialSettings.alwaysUseTextEditor;
        const schemaBranchChanged = settings.schemaBranch !== initialSettings.schemaBranch;

        if ([themeChanged, alwaysUseTextEditorChanged, schemaBranchChanged].includes(true)) {
            const result = await ask(
                "You need to reload the app to apply these changes. Do you want to reload now? (Any unsaved changes will be lost!)",
                {
                    title: "Restart Required"
                }
            );
            if (result) {
                await emit("nh://reload");
            }
        }

        await close();
    };

    const onReset = async () => {
        const result = await ask(
            "Are you sure you want to reset all settings to their default values? (Any unsaved changes will be lost!)",
            {
                title: "Reset Settings"
            }
        );
        if (result) {
            await SettingsManager.reset();
            setSettings(await SettingsManager.get());
            close();
            await emit("nh://reload");
        }
    };

    return (
        <Container className="d-flex flex-column vh-100 mt-0">
            <Row className="flex-grow-1">
                <Col className="position-relative">
                    <div className="position-absolute top-0 bottom-0 w-100">
                        <Form
                            onChange={(e) => setSettings(e.formData)}
                            formData={settings}
                            uiSchema={uiSchema}
                            schema={settingsSchema as JSONSchema7}
                            ArrayFieldTemplate={InspectorArrayFieldTemplate}
                            ObjectFieldTemplate={InspectorObjectFieldTemplate}
                            FieldTemplate={InspectorFieldTemplate}
                            fields={customFields}
                        />
                    </div>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col>
                    <Button onClick={onSave} className="w-100">
                        Save
                    </Button>
                </Col>
                <Col>
                    <Button onClick={onReset} className="w-100" variant="danger">
                        Reset
                    </Button>
                </Col>
                <Col>
                    <Button onClick={close} className="w-100" variant="secondary">
                        Cancel
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default SettingsWindow;
