import { clipboard, process } from "@tauri-apps/api";
import Image from "react-bootstrap/Image";
import CenteredSpinner from "../Common/Spinner/CenteredSpinner";
import errorImage from "../Common/Images/error_image.png";
import { windowBlur } from "./Store/BlurSlice";
import { useAppSelector } from "./Store/Hooks";

function MainWindowBlur() {
    const status = useAppSelector((state) => windowBlur.selectBlurStatus(state));
    const error = useAppSelector((state) => windowBlur.selectBlurError(state));

    return (
        <div className={`window-blur${status === "idle" ? " d-none" : ""}`}>
            {status === "loading" && <CenteredSpinner />}
            {status === "error" && (
                <div className="h-100 w-100 flex-column d-flex align-items-center justify-content-center">
                    <Image src={errorImage} alt="Error" />
                    <h4 className="display-4 text-danger">Gorp</h4>
                    <p>
                        There was a critical error in the editor, details of the error are shown
                        below
                    </p>
                    <textarea value={error} style={{ resize: "none" }} className="w-50" readOnly />
                    <button
                        className="btn btn-outline-primary mt-2 w-50"
                        onClick={() => clipboard.writeText(error)}
                    >
                        Copy error to clipboard
                    </button>
                    <button
                        className="btn btn-outline-secondary mt-2 w-50"
                        onClick={() => process.exit(1)}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

export default MainWindowBlur;
