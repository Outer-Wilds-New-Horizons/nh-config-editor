import Editor, { Monaco } from "@monaco-editor/react";
import { invoke } from "@tauri-apps/api/tauri";
import { editor } from "monaco-editor";
import { useState } from "react";
import { getMonacoJsonDiagnostics } from "../../../../Common/AppData/SchemaStore";
import { SettingsManager } from "../../../../Common/AppData/Settings";
import CenteredSpinner from "../../../../Common/Spinner/CenteredSpinner";
import { ThemeMonacoMap } from "../../../../Common/Theme/ThemeManager";
import { useSettings } from "../../../../Wrapper";
import { EditorProps } from "../Editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

function TextEditor(props: EditorProps) {
    const { theme } = useSettings();

    const [loadStarted, setLoadStarted] = useState(false);
    const [fileText, setFileText] = useState<string | null>(null);

    if (!loadStarted) {
        setLoadStarted(true);
        if (props.file.path.startsWith("@@void@@")) {
            SettingsManager.get().then(({ schemaBranch }) => {
                setFileText(
                    JSON.stringify({ $schema: props.file.getSchemaLink(schemaBranch) }, null, 4)
                );
            });
        } else {
            invoke("read_file_as_string", { path: props.file.path }).then((data) => {
                setFileText(data as string);
            });
        }
    }

    if (fileText === null) {
        return <CenteredSpinner />;
    }

    const handleComponentDidMount = async (codeEditor: IStandaloneCodeEditor, monaco: Monaco) => {
        monaco.editor.setTheme(ThemeMonacoMap[theme]);
        const jsonDiagnostics = await getMonacoJsonDiagnostics();
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions(jsonDiagnostics);
    };

    return (
        <Editor
            onChange={(value) => {
                props.onChange?.();
                props.file.data = value ?? "";
            }}
            loading={<CenteredSpinner />}
            defaultLanguage={props.file.getMonacoLanguage()}
            defaultValue={fileText}
            onMount={handleComponentDidMount}
        />
    );
}

export default TextEditor;
