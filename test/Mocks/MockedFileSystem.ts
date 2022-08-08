/**
 * Describes a mocked file for use in tests.
 * @property {string} name The name of the file.
 * @property {string} extension The extension of the file.
 * @property {string} path The path of the file.
 * @property {string} content The content of the file.
 * @property {boolean} isFolder Whether the file is a directory.
 * @property {MockFile[]} children The children of the folder, if this is a folder.
 */
export type MockFile = {
    name: string;
    extension: string;
    path: string;
    content: string;
    isFolder: boolean;
    children: MockFile[];
};

/**
 * A mock file system.
 * This class is used to mock the file system for testing.
 * @property {MockFile} rootFolder The root folder of the file system.
 * @property {string} separator The path separator to use (and expect) in file paths.
 */
export default class MockedFileSystem {
    rootFolder: MockFile;
    separator = "/";

    /**
     * Creates a new MockedFileSystem
     * @param sep The separator to use for paths, UNIX ("/") by default.
     */
    constructor(sep = "/") {
        this.separator = sep ?? "/";
        this.rootFolder = {
            name: "@@root@@",
            extension: "",
            content: "",
            path: "",
            children: [],
            isFolder: true
        };
    }

    /**
     * Creates a new set of files with the given paths and contents.
     * @param obj An object where the keys are the path for each file, and the values are the content of the file. Parent folders are created if they don't exist.
     */
    setFromObject(obj: Record<string, string>): void {
        for (const key in obj) {
            const value = obj[key];
            this.createFileWithParent(key, value);
        }
    }

    /**
     * Finds a file or folder in the file system.
     * @param path The path of the file or folder.
     * @param parentFolder The parent folder to explicitly search in, leave blank to recursively search.
     * @throws Error if the file or folder doesn't exist.
     */
    findFileOrFolder(path: string, parentFolder?: MockFile): MockFile {
        if (path === "") return this.rootFolder;
        const searchFolder = parentFolder ?? this.rootFolder;
        const ancestors = path.split(this.separator);
        if (ancestors.length === 1) {
            const result = searchFolder.children.find((f) => f.name === ancestors[0]);
            if (result) {
                return result;
            } else {
                throw new Error(`File or folder ${path} not found`);
            }
        } else {
            const childFolder = searchFolder.children.find(
                (folder) => folder.name === ancestors[0]
            );
            if (childFolder && childFolder.isFolder) {
                return this.findFileOrFolder(ancestors.slice(1).join(this.separator), childFolder);
            } else {
                throw new Error(`Folder ${ancestors[0]} not found`);
            }
        }
    }

    /**
     * Checks if a file exists.
     * @param path The path of the file.
     */
    fileExists(path: string): boolean {
        try {
            this.findFileOrFolder(path);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Check if the file at the given path is a folder
     * @param path The path of the file
     */
    isFolder(path: string): boolean {
        return this.findFileOrFolder(path).isFolder;
    }

    /**
     * Loads a file's contents from the file system.
     * @param path The path of the file.
     */
    readFile(path: string): string {
        return this.findFileOrFolder(path).content;
    }

    /**
     * Writes content to a file at the given path.
     * @param path The path of the file.
     * @param content The content to write.
     * @param create Whether to create the file if it doesn't exist.
     */
    writeFile(path: string, content: string, create = false): void {
        if (create) {
            this.createFileWithParent(path, content);
        } else {
            const file = this.findFileOrFolder(path);
            file.content = content;
        }
    }

    /**
     * Creates a new folder at the given path.
     * @param path The path of the folder.
     * @param errorOnExists Whether to throw an error if the folder already exists.
     */
    createFolder(path: string, errorOnExists = false): void {
        if (errorOnExists && this.fileExists(path)) {
            throw new Error(`Folder ${path} already exists`);
        }
        const ancestors = path.split(this.separator);
        const parentFolder = ancestors.slice(0, -1).join(this.separator);
        const folderName = ancestors[ancestors.length - 1];
        const parent = this.findFileOrFolder(parentFolder);
        parent.children.push({
            name: folderName,
            extension: "",
            content: "",
            path: path,
            children: [],
            isFolder: true
        });
    }

    /**
     * Creates a folder and all its ancestors.
     * @param path The path of the folder.
     * @param errorOnExists Whether to throw an error if the folder already exists.
     */
    createFolderAll(path: string, errorOnExists = false): void {
        if (errorOnExists && this.fileExists(path)) {
            throw new Error(`Folder ${path} already exists`);
        }
        const ancestors = path.split(this.separator);
        let currentPath = "";
        for (const ancestor of ancestors) {
            currentPath += ancestor;
            if (!this.fileExists(currentPath)) {
                this.createFolder(currentPath);
            }
            currentPath += this.separator;
        }
    }

    /**
     * Creates a new file with the given path and content.
     * @param path The path of the file.
     * @param content The content of the file.
     * @param errorOnExists Whether to throw an error if the file already exists.
     */
    createFile(path: string, content: string, errorOnExists = false): void {
        if (errorOnExists && this.fileExists(path)) {
            throw new Error(`File ${path} already exists`);
        }
        const ancestors = path.split(this.separator);
        const parentFolder = ancestors.slice(0, -1).join(this.separator);
        const fileName = ancestors[ancestors.length - 1];
        const parent = this.findFileOrFolder(parentFolder);
        parent.children.push({
            name: fileName,
            extension: fileName.split(".")[1] ?? "",
            content: content,
            path: path,
            children: [],
            isFolder: false
        });
    }

    /**
     * Creates a new file with the given path and content, and creates any ancestors.
     * @param path The path of the file.
     * @param content The content of the file.
     * @param errorOnExists Whether to throw an error if the file already exists.
     */
    createFileWithParent(path: string, content: string, errorOnExists = false): void {
        const ancestors = path.split(this.separator);
        const parentFolder = ancestors.slice(0, -1).join(this.separator);
        this.createFolderAll(parentFolder);
        this.createFile(path, content, errorOnExists);
    }

    /**
     * Recursively walks a folder and returns an array of all files and sub-folders.
     * @param path Path of the folder to walk.
     * @returns An array of all files and sub-folders.
     */
    walkFolder(path: string): MockFile[] {
        const folder = this.findFileOrFolder(path);
        let result: MockFile[] = [];
        for (const child of folder.children) {
            result.push(child);
            if (child.isFolder) {
                result = result.concat(this.walkFolder(child.path));
            }
        }
        return result;
    }

    /**
     * Deletes a file.
     * @param path The path of the file.
     * @param allowFolders Whether to allow folders to be deleted.
     * @throws Error if the file doesn't exist.
     * @throws Error if the file is a folder.
     */
    deleteFile(path: string, allowFolders = false): void {
        const file = this.findFileOrFolder(path);
        if (!allowFolders && file.isFolder) throw new Error("Can't delete folders!");
        const parent = this.findFileOrFolder(file.path.slice(0, -file.name.length - 1));
        parent.children = parent.children.filter((f) => f !== file);
    }

    /**
     * Deletes a folder.
     * @param path The path of the folder.
     */
    deleteFolder(path: string): void {
        this.deleteFile(path, true);
    }

    /**
     * Copies a file to a new location.
     * @param sourcePath The path of the file to copy.
     * @param targetPath The path of the new file.
     */
    copyFile(sourcePath: string, targetPath: string): void {
        const sourceFile = this.findFileOrFolder(sourcePath);
        this.createFile(targetPath, sourceFile.content);
    }

    /**
     * Copies a folder to a new location.
     * @param sourcePath The path of the folder to copy.
     * @param targetPath The path of the new folder.
     */
    copyFolder(sourcePath: string, targetPath: string): void {
        const sourceFolder = this.findFileOrFolder(sourcePath);
        this.createFolder(targetPath);
        for (const file of sourceFolder.children) {
            if (file.isFolder) {
                this.copyFolder(file.path, targetPath + this.separator + file.name);
            } else {
                this.copyFile(file.path, targetPath + this.separator + file.name);
            }
        }
    }

    /**
     * Converts this file system to a string.
     */
    toString(): string {
        return JSON.stringify(this.rootFolder);
    }
}
