import {Spinner} from "react-bootstrap";
import {SpinnerProps} from "react-bootstrap/Spinner";

function CenteredSpinner(props: SpinnerProps) {
    return <div className={"h-100 w-100 d-flex justify-content-center align-items-center"}>
        <Spinner className={"text-center"} {...props}/>
    </div>;
}

export default CenteredSpinner;
