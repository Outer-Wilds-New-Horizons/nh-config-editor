import {ProjectFile, ProjectFileType} from "./ProjectView";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {
    Box2,
    Bullseye,
    FileEarmarkCodeFill,
    FileEarmarkFill,
    FileEarmarkImageFill,
    FileEarmarkMusicFill,
    FileMedicalFill,
    Globe,
    Translate
} from "react-bootstrap-icons";
import {cloneElement, ReactElement} from "react";
import ProjectFolder from "./ProjectFolder";

export type ProjectItemProps = {
    file: ProjectFile;
}

function getIcon(fileType: ProjectFileType): ReactElement {
    switch (fileType) {
        case "planet":
            return <Globe/>;
        case "system":
            return <Bullseye/>;
        case "translation":
            return <Translate/>;
        case "addon_manifest":
            return <FileMedicalFill/>;
        case "mod_manifest":
            return <FileMedicalFill/>;
        case "asset-bundle":
            return <Box2/>;
        case "xml":
            return <FileEarmarkCodeFill/>;
        case "image":
            return <FileEarmarkImageFill/>;
        case "sound":
            return <FileEarmarkMusicFill/>;
        default:
            return <FileEarmarkFill/>;
    }
}

function ProjectItem(props: ProjectItemProps) {

    if (props.file.isFolder) {
        return <ProjectFolder concrete={false} name={props.file.name} children={props.file.children}/>;
    } else {
        return <Row>
            <Col className={"d-flex align-items-center"}>
                {cloneElement(getIcon(props.file.fileType), {"className": "fs-6 my-auto"})}
                <span className={"fs-5 ms-2"}>{props.file.name}</span>
            </Col>
        </Row>
    }
}

export default ProjectItem;
