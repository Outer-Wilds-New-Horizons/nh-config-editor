import { ReactElement } from "react";

function CenteredMessage(props: {
    message: string;
    variant?: string;
    className?: string;
    after?: ReactElement;
}) {
    return (
        <div
            className={`user-select-none text-muted d-flex h-100 flex-grow-1 flex-column justify-content-center align-items-center ${props.className}`}
        >
            <div className={`text-center ${props.variant ? `text-${props.variant}` : ""}`}>
                {props.message}
                <br />
                {props.after}
            </div>
        </div>
    );
}

export default CenteredMessage;
