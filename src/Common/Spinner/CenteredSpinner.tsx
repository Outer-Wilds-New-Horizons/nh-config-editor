import Spinner from "./Spinner";

function CenteredSpinner() {
    return (
        <div className={"h-100 w-100 d-flex justify-content-center align-items-center"}>
            <Spinner />
        </div>
    );
}

export default CenteredSpinner;
