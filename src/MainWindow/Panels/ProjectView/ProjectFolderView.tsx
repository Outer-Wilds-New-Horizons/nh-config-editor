import { cloneElement, useState } from "react";
import { Collapse } from "react-bootstrap";
import { CaretRightFill } from "react-bootstrap-icons";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { connect } from "react-redux";
import { ProjectFile, selectProjectFileByParentDirFactory } from "../../Store/ProjectFilesSlice";
import { determineIcon } from "../../Store/FileUtils";
import { RootState } from "../../Store/Store";
import ProjectItemView from "./ProjectItemView";

function ProjectFolderView(props: { file: ProjectFile; childPaths: string[] }) {
    const [open, setOpen] = useState(false);

    return (
        <Row>
            <Col
                onClick={() => setOpen(!open)}
                className="ps-2 d-flex w-100 interactable align-items-center"
            >
                <span className="d-flex align-items-center pe-0 me-0">
                    <CaretRightFill className={`fs-6 my-auto folder-caret ${open ? "open" : ""}`} />
                    {cloneElement(determineIcon(props.file, true), { className: "ms-1 my-auto" })}
                    <span className="fs-5 ms-2">{props.file.name}</span>
                </span>
            </Col>
            <Collapse in={open}>
                <div className="ms-4">
                    {props.childPaths.map((path) => (
                        <ProjectItemView relativePath={path as string} key={path} />
                    ))}
                </div>
            </Collapse>
        </Row>
    );
}

// https://blog.isquaredsoftware.com/2017/12/idiomatic-redux-using-reselect-selectors/
// Essentially reselect won't work if we call the selector with different arguments back-to-back.
// So we need to use a factory function to create a new selector for each component.
const mapStateToProps = () => {
    const uniqueSelectProjectFilesByParentDir = selectProjectFileByParentDirFactory();

    return (state: RootState, ownProps: { file: ProjectFile }) => {
        const childPaths = uniqueSelectProjectFilesByParentDir(
            state.projectFiles,
            ownProps.file.relativePath
        );
        return { childPaths } as { childPaths: string[] };
    };
};

export default connect(mapStateToProps)(ProjectFolderView);
