import { invoke } from "@tauri-apps/api/tauri";
import { useState } from "react";
import { ImageProps, Image } from "react-bootstrap";
import CenteredSpinner from "./Spinner/CenteredSpinner";

export type AsyncImageProps = {
    path: string;
} & ImageProps;

function AsyncImage(props: AsyncImageProps) {
    const [loadStarted, setLoadStarted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [data, setData] = useState<string | null>(null);

    if (!loadStarted) {
        setLoadStarted(true);
        invoke("load_image_as_base_64", { imgPath: props.path })
            .then((newData) => setData(newData as string))
            .catch(setErrorMessage);
    }

    if (data === null) {
        if (errorMessage) {
            return <span className="text-danger">{errorMessage}</span>;
        } else {
            return <CenteredSpinner />;
        }
    } else {
        return <Image {...props} src={`data:image/png;base64,${data}`} />;
    }
}

export default AsyncImage;
