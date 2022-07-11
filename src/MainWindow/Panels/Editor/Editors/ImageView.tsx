import AsyncImage from "../../../../Common/AsyncImage";
import { ProjectFile } from "../../ProjectView/ProjectFile";

function ImageView(props: { file: ProjectFile }) {
    return (
        <div className="mx-5 d-flex justify-content-center align-items-center h-100">
            <AsyncImage path={props.file.path} alt={props.file.name} fluid />
        </div>
    );
}

export default ImageView;
