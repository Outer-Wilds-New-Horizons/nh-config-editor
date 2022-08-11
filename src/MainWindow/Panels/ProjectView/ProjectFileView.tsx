import { cloneElement } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useAppDispatch } from "../../Store/Hooks";
import { openFile } from "../../Store/OpenFilesSlice";
import { ProjectFile } from "../../Store/ProjectFilesSlice";
import { determineIcon } from "../../Store/FileUtils";

function ProjectFileView(props: { file: ProjectFile }) {
    const dispatch = useAppDispatch();

    const onClick = () => dispatch(openFile(props.file));

    return (
        <Row className="interactable" onClick={onClick}>
            <Col className="d-flex align-items-center">
                {cloneElement(determineIcon(props.file, false), { className: "my-auto ms-3" })}
                <span className="fs-5 ms-2 text-nowrap">{props.file.name}</span>
            </Col>
        </Row>
    );
}

export default ProjectFileView;
