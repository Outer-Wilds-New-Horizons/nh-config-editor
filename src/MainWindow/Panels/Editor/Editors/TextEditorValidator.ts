import { Monaco } from "@monaco-editor/react";
import { JSONPath } from "jsonpath-plus";
import * as monaco from "monaco-editor";
import {
    JSONDocument,
    getLanguageService,
    TextDocument,
    ObjectASTNode,
    ArrayASTNode
} from "vscode-json-languageservice";
import { MutableRefObject } from "react";
import { OpenFile } from "../../../Store/OpenFilesSlice";
import IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;
import IMarkerData = monaco.editor.IMarkerData;
const findPositionOfPath = (
    txtDoc: TextDocument,
    jsonDoc: JSONDocument,
    content: string,
    path: string[]
) => {
    let currentNode = jsonDoc.root;
    for (const key of path) {
        if (currentNode === undefined) {
            break;
        }
        if (currentNode!.type === "object") {
            currentNode = (currentNode as ObjectASTNode).properties.find(
                (p) => p.keyNode.value === key
            )?.valueNode;
        } else if (currentNode!.type === "array") {
            currentNode = (currentNode as ArrayASTNode).items[JSON.parse(key)];
        }
    }
    if (currentNode !== undefined && currentNode.type === "property") {
        currentNode = currentNode.valueNode;
    }
    return [
        txtDoc.positionAt(currentNode?.offset ?? 0),
        txtDoc.positionAt((currentNode?.offset ?? 0) + (currentNode?.length ?? 0))
    ];
};

const showErrors = (
    file: OpenFile,
    model: MutableRefObject<[Monaco, IStandaloneCodeEditor] | undefined>
) => {
    if (model.current) {
        const [monacoInstance, codeEditor] = model.current;
        const codeModel = codeEditor.getModel();
        if (codeModel) {
            const txtDoc = TextDocument.create("", "", 0, codeModel.getValue());
            const jsonDoc = getLanguageService({}).parseJSONDocument(txtDoc);

            const errors: IMarkerData[] = file.errors.map((e) => {
                const position = findPositionOfPath(
                    txtDoc,
                    jsonDoc,
                    codeModel.getValue(),
                    JSONPath.toPathArray(e.location).slice(1)
                );
                return {
                    severity: 8,
                    startLineNumber: position[0].line + 1,
                    startColumn: position[0].character + 1,
                    endLineNumber: position[1].line + 1,
                    endColumn: position[1].character + 1,
                    message: e.message
                };
            });

            monacoInstance.editor.setModelMarkers(codeModel, "owner", errors);
        }
    }
};

export default showErrors;
