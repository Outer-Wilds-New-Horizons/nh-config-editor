import { IEditorProps } from "../Editor";

function AudioView(props: IEditorProps) {
    return (
        <div className="mx-5 d-flex justify-content-center align-items-center h-100">
            <audio controls src={`data:audio/mpeg;base64,${props.fileData}`} />
        </div>
    );
}

export default AudioView;
