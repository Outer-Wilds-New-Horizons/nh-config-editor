import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom/client";
import CenteredSpinner from "./Common/CenteredSpinner";

import "./Common/common.css";

const MainWindow = React.lazy(() => import("./MainWindow/MainWindow"));
const StartWindow = React.lazy(() => import("./StartWindow/StartWindow"));

const root = document.getElementById("root");

if (root === null) {
    console.error("Catastrophic Failure");
} else {

    let page: JSX.Element;

    switch (document.location.hash) {
        case "#MAIN":
            page = <MainWindow/>;
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




