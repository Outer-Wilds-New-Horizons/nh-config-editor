function CenteredMessage(props: { message: string; className?: string }) {
    return (
        <div
            className={`user-select-none text-muted d-flex h-100 flex-grow-1 flex-column justify-content-center align-items-center ${props.className}`}
        >
            <div className="text-center">{props.message}</div>
        </div>
    );
}

export default CenteredMessage;
