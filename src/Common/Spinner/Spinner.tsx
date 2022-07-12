import Image from "react-bootstrap/Image";
import spinnerImage from "../Images/spinner_image.png";

function Spinner(props: { size?: [number, number]; className?: string }) {
    return (
        <Image
            className={`nh-spinner p-0 m-0 ${props.className ?? ""}`}
            src={spinnerImage}
            width={props.size?.[0] ?? 250}
            height={props.size?.[1] ?? 250}
            alt="Loading..."
        />
    );
}

export default Spinner;
