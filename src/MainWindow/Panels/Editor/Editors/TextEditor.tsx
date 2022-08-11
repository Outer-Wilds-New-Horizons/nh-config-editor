import Editor, { Monaco } from "@monaco-editor/react";
import { getCurrent } from "@tauri-apps/api/window";
import * as monaco from "monaco-editor";
import { getMonacoJsonDiagnostics } from "../../../../Common/AppData/SchemaStore";
import CenteredSpinner from "../../../../Common/Spinner/CenteredSpinner";
import { ThemeMonacoMap } from "../../../../Common/Theme/ThemeManager";
import { getMonacoLanguage } from "../../../Store/FileUtils";
import { useSettings } from "../../../../Wrapper";
import { IEditorProps } from "../Editor";
import IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

function TextEditor(props: IEditorProps) {
    const { theme } = useSettings();

    const handleComponentDidMount = async (
        codeEditor: IStandaloneCodeEditor,
        monacoInstance: Monaco
    ) => {
        let chosenTheme = theme;
        if (theme === "Follow System") {
            chosenTheme =
                (await getCurrent().theme()) === "dark" ? "Default Dark" : "Default Light";
        }
        monacoInstance.editor.setTheme(ThemeMonacoMap[chosenTheme]);
        const jsonDiagnostics = await getMonacoJsonDiagnostics();
        monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions(jsonDiagnostics);
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
