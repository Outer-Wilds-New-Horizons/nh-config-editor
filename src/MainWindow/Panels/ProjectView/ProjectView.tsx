import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import CenteredSpinner from "../../../Common/Spinner/CenteredSpinner";
import { ProjectFile } from "./ProjectFile";
import ProjectItem from "./ProjectItem";
import ProjectViewHeader from "./ProjectViewHeader";

export function compareItems(a: ProjectFile, b: ProjectFile): number {
    if (a.isFolder && !b.isFolder) {
        return -1;
    } else if (!a.isFolder && b.isFolder) {
        return 1;
    } else {
        return a.name.localeCompare(b.name);
    }
}

type ProjectViewProps = {
    header: string;
    headerPath: string;
    fileTree: ProjectFile[] | null;
    onFileOpen?: (file: ProjectFile) => void;
    onFileContextMenu?: (file: ProjectFile, position: [number, number]) => void;
};

function ProjectView(props: ProjectViewProps) {
    if (props.fileTree === null) {
        return <CenteredSpinner />;
    } else {
        return (
            <div className="d-flex flex-grow-1 flex-column">
                <Row className="border-bottom lt-border">
                    <Col className="d-flex align-items-center justify-content-center my-1 p-0">
                        <ProjectViewHeader
                            headerPath={props.headerPath}
                            headerFallback={props.header}
                        />
                    </Col>
                </Row>
                <Row className="flex-grow-1">
                    <Col className="position-relative overflow-y-auto">
                        <div className="position-absolute top-0 bottom-0">
                            {props.fileTree.sort(compareItems).map((item) => (
                                <ProjectItem
                                    onOpenFile={props.onFileOpen}
                                    onFileContextMenu={props.onFileContextMenu}
                                    key={item.path}
                                    file={item}
                                    {...props}
                                />
                            ))}
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ProjectView;
