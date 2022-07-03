import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom/client";
import CenteredSpinner from "./Common/CenteredSpinner";

import "./Common/common.css";

const MainWindow = React.lazy(() => import("./MainWindow/MainWindow"));
const StartWindow = React.lazy(() => import("./StartWindow/StartWindow"));
const NewProjectWindow = React.lazy(() => import("./NewProjectWindow/NewProjectWindow"));

const root = document.getElementById("root");

document.oncontextmenu = () => false;

if (root === null) {
    console.error("Catastrophic Failure");
} else {

    let page: JSX.Element;

    switch (document.location.hash) {
        case "#MAIN":
            page = <MainWindow/>;
            break;
        case "#NEWPROJECT":
            page = <NewProjectWindow/>;
            break;
        case "#START":
        default:
            page = <StartWindow/>;
            break;
    }

    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <React.Suspense fallback={<CenteredSpinner/>}>
                {page}
            </React.Suspense>
        </React.StrictMode>
    );
}




