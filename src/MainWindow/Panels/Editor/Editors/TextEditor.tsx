import Editor, { Monaco } from "@monaco-editor/react";
import { shell } from "@tauri-apps/api";
import { editor } from "monaco-editor";
import { useState } from "react";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";
import { getMonacoJsonDiagnostics } from "../../../../Common/AppData/SchemaStore";
import { SettingsManager } from "../../../../Common/AppData/Settings";
import CenteredSpinner from "../../../../Common/Spinner/CenteredSpinner";
import { tauriCommands } from "../../../../Common/TauriCommands";
import { ThemeMonacoMap } from "../../../../Common/Theme/ThemeManager";
import { useSettings } from "../../../../Wrapper";
import { IEditorProps } from "../Editor";
import CenteredMessage from "./CenteredMessage";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

function TextEditor(props: IEditorProps) {
    const { theme } = useSettings();

    const [loadStarted, setLoadStarted] = useState(false);
    const [fileText, setFileText] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadFile = async (): Promise<string> => {
        return await tauriCommands.readFileText(props.file.path);
    };

    if (!loadStarted) {
        setLoadStarted(true);
        if (props.file.path.startsWith("@@void@@")) {
            SettingsManager.get().then(({ schemaBranch }) => {
                setFileText(
                    JSON.stringify({ $schema: props.file.getSchemaLink(schemaBranch) }, null, 4)
                );
            });
        } else {
            loadFile().then(setFileText).catch(setErrorMessage);
        }
    }

    if (fileText === null || !loadStarted) {
        if (errorMessage) {
            return (
                <CenteredMessage
                    variant="danger"
                    className="text-danger"
                    message={`This doesn't seem to be a text file (${errorMessage})`}
                    after={
                        <Button
                            onClick={() => shell.open(props.file.path)}
                            variant="outline-info"
                            className="mt-2 mx-auto d-flex align-items-center"
                        >
                            <BoxArrowUpRight className="me-1" />
                            Open In Default Editor
                        </Button>
                    }
                />
            );
        } else {
            return <CenteredSpinner />;
        }
    }

    const handleComponentDidMount = async (codeEditor: IStandaloneCodeEditor, monaco: Monaco) => {
        monaco.editor.setTheme(ThemeMonacoMap[theme]);
        const jsonDiagnostics = await getMonacoJsonDiagnostics();
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions(jsonDiagnostics);
    };

    return (
        <Editor
            onChange={(value) => {
                value = value ?? "";
                props.onChange?.(value);
                setFileText(value);
            }}
            loading={<CenteredSpinner />}
            language={props.file.getMonacoLanguage()}
            value={fileText}
            onMount={handleComponentDidMount}
        />
    );
}

export default TextEditor;
