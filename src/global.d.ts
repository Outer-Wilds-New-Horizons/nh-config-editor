// Allows importing of images
declare module "*.png" {
    const value: string;
    export = value;
}

// Allows importing of xsd files
declare module "*.xsd" {
    const value: string;
    export = value;
}
