import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom/client";

import "../Common/common.css";
import "./index.css";
import MainWindow from "./MainWindow";

const root = document.getElementById("root");

if (root === null) {
    console.error("Catastrophic Failure");
} else {
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <MainWindow/>
        </React.StrictMode>
    );
}


