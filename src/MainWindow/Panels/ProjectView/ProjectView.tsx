import { sep } from "@tauri-apps/api/path";
import { useEffect } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { connect } from "react-redux";
import CenteredSpinner from "../../../Common/Spinner/CenteredSpinner";
import { useAppDispatch, useAppSelector } from "../../Store/Hooks";
import {
    loadProjectFiles,
    selectProjectFileByParentDirFactory
} from "../../Store/ProjectFilesSlice";
import { RootState } from "../../Store/Store";
import ProjectItemView from "./ProjectItemView";
import ProjectViewHeader from "./ProjectViewHeader";

type ProjectViewProps = {
    paths: string[];
};

function ProjectView(props: ProjectViewProps) {
    const dispatch = useAppDispatch();

    const projectLoaded = useAppSelector((state) => state.project.status === "done");
    const projectPath = useAppSelector((state) => state.project.path);
    const projectUniqueName = useAppSelector((state) => state.project.uniqueName);

    const status = useAppSelector((state) => state.projectFiles.status);
    const error = useAppSelector((state) => state.projectFiles.error);

    useEffect(() => {
        if (status === "idle" && projectLoaded) {
            dispatch(loadProjectFiles(projectPath));
        }
    }, [status, dispatch, projectLoaded]);

    if (status === "loading" || status === "idle") {
        return <CenteredSpinner />;
    } else if (status === "error") {
        return <div>{error ?? "Unknown Error"}</div>;
    } else {
        return (
            <div className="d-flex flex-grow-1 flex-column">
                <Row className="border-bottom lt-border">
                    <Col className="d-flex align-items-center justify-content-center my-1 p-0">
                        <ProjectViewHeader
                            headerPath={`${projectPath}${sep}subtitle.png`}
                            headerFallback={projectUniqueName}
                        />
                    </Col>
                </Row>
                <Row className="flex-grow-1">
                    <Col className="position-relative overflow-y-auto">
                        <div className="position-absolute top-0 bottom-0">
                            {props.paths.map((path) => (
                                <ProjectItemView relativePath={path as string} key={path} />
                            ))}
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

// https://blog.isquaredsoftware.com/2017/12/idiomatic-redux-using-reselect-selectors/
// Essentially reselect won't work if we call the selector with different arguments back-to-back.
// So we need to use a factory function to create a new selector for each component.
const mapStateToProps = () => {
    const uniqueSelectProjectFileByParentDir = selectProjectFileByParentDirFactory();
    return (state: RootState) => {
        const paths = uniqueSelectProjectFileByParentDir(state.projectFiles, "/");
        return { paths } as { paths: string[] };
    };
};

export default connect(mapStateToProps)(ProjectView);
