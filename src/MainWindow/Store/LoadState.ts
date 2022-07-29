export type LoadStatus = "idle" | "loading" | "done" | "error";
export type LoadError = string;

export type LoadState = {
    status: LoadStatus;
    error: LoadError;
};

export const initialLoadState: LoadState = {
    status: "idle",
    error: "Unknown Error"
};
