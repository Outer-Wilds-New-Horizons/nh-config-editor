import Image from "react-bootstrap/Image";
import { IEditorProps } from "../Editor";

function ImageView(props: IEditorProps) {
    return (
        <div className="mx-5 d-flex justify-content-center align-items-center h-100">
            <Image src={`data:image/png;base64,${props.fileData}`} fluid />
        </div>
    );
}

export default ImageView;
