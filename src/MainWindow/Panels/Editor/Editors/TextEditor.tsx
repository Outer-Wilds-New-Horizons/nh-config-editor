import Editor, { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { getMonacoJsonDiagnostics } from "../../../../Common/AppData/SchemaStore";
import CenteredSpinner from "../../../../Common/Spinner/CenteredSpinner";
import { ThemeMonacoMap } from "../../../../Common/Theme/ThemeManager";
import { getMonacoLanguage } from "../../../../Store/FileUtils";
import { useSettings } from "../../../../Wrapper";
import { IEditorProps } from "../Editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

function TextEditor(props: IEditorProps) {
    const { theme } = useSettings();

    const handleComponentDidMount = async (codeEditor: IStandaloneCodeEditor, monaco: Monaco) => {
        monaco.editor.setTheme(ThemeMonacoMap[theme]);
        const jsonDiagnostics = await getMonacoJsonDiagnostics();
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions(jsonDiagnostics);
    };

    return (
        <Editor
            onChange={(value) => {
                props.onChange?.(value ?? "");
            }}
            loading={<CenteredSpinner />}
            language={getMonacoLanguage(props.file)}
            value={props.fileData}
            onMount={handleComponentDidMount}
        />
    );
}

export default TextEditor;
