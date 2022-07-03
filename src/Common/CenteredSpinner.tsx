
function CenteredSpinner() {
    return <div className={"h-100 w-100 d-flex justify-content-center align-items-center"}>
        <img className="nh-spinner" height="192" width="192" src="src/Common/Spinner/spinner_image.png"
             alt="Loading..."/>
    </div>;
}

export default CenteredSpinner;
