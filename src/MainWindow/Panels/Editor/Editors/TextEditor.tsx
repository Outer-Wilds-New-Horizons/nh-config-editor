import Editor, { Monaco } from "@monaco-editor/react";
import { getCurrent } from "@tauri-apps/api/window";
import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";
import { getMonacoJsonDiagnostics } from "../../../../Common/AppData/SchemaStore";
import CenteredSpinner from "../../../../Common/Spinner/CenteredSpinner";
import { ThemeMonacoMap } from "../../../../Common/Theme/ThemeManager";
import { getMonacoLanguage } from "../../../Store/FileUtils";
import { useSettings } from "../../../../Wrapper";
import { IEditorProps } from "../Editor";
import showErrors from "./TextEditorValidator";
import IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

function TextEditor(props: IEditorProps) {
    const model = useRef<[Monaco, IStandaloneCodeEditor]>();
    const { theme } = useSettings();

    const handleComponentDidMount = async (
        codeEditor: IStandaloneCodeEditor,
        monacoInstance: Monaco
    ) => {
        model.current = [monacoInstance, codeEditor];
        let chosenTheme = theme;
        if (theme === "Follow System") {
            chosenTheme =
                (await getCurrent().theme()) === "dark" ? "Default Dark" : "Default Light";
        }
        monacoInstance.editor.setTheme(ThemeMonacoMap[chosenTheme]);
        const jsonDiagnostics = await getMonacoJsonDiagnostics();
        monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions(jsonDiagnostics);
        showErrors(props.file, model);
    };

    useEffect(() => showErrors(props.file, model), [model.current, props.file.errors]);

    return (
        <Editor
            onChange={(value) => {
                props.onChange?.(value ?? "");
            }}
            loading={<CenteredSpinner />}
            language={getMonacoLanguage(props.file)}
            value={props.fileData}
            className="z-40"
            onMount={handleComponentDidMount}
        />
    );
}

export default TextEditor;
