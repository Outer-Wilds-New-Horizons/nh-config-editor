import { open } from "@tauri-apps/api/shell";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { BoxArrowUpRight } from "react-bootstrap-icons";

function DocsLink(props: { id: string; docsSchema: string }) {
    const url = `${props.docsSchema}#${props.id.slice(5)}`;

    // noinspection RequiredAttributes
    return (
        <a onClick={() => open(url)} href="#" className="link-secondary ms-2 mb-1">
            <BoxArrowUpRight />
        </a>
    );
}

export default DocsLink;
