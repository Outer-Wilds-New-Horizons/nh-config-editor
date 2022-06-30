import {invoke} from "@tauri-apps/api/tauri";
import {useState} from "react";
import Image from "react-bootstrap/Image";
import CenteredSpinner from "../../Common/CenteredSpinner";
import {EditorProps} from "../Editor";

function ImageView(props: EditorProps) {

    const [loadStarted, setLoadStarted] = useState(false);
    const [imageData, setImageData] = useState<string | null>(null);

    const loadImage = async (): Promise<string> => {
        return await invoke("load_image_as_base_64", {imgPath: props.file.path});
    };

    if (!loadStarted) {
        setLoadStarted(true);
        loadImage().then((data) => setImageData(data));
    }

    if (imageData === null) {
        return <CenteredSpinner animation={"border"} variant={"primary"}/>;
    } else {
        return <div className={"d-flex justify-content-center align-items-center h-100"}>
            <Image src={`data:image/png;base64,${imageData}`} alt={props.file.name} fluid/>
        </div>;
    }

}

export default ImageView;
