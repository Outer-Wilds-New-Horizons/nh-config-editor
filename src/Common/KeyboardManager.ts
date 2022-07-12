import { isRegistered, register, unregister } from "@tauri-apps/api/globalShortcut";

let locked = false;

export type KeyboardShortcutMapping = {
    [key: string]: string;
};

async function setupKeyboardShortcuts(
    keyBoardShortcutMapping: KeyboardShortcutMapping,
    handler: (actionId: string) => void
) {
    await destroyKeyboardShortcuts(keyBoardShortcutMapping);
    if (locked) return;
    locked = true;
    for (const [key, shortcut] of Object.entries(keyBoardShortcutMapping)) {
        if (!(await isRegistered(shortcut))) {
            await register(shortcut, () => handler(key));
        }
    }
}

async function destroyKeyboardShortcuts(keyBoardShortcutMapping: KeyboardShortcutMapping) {
    for (const shortcut of Object.values(keyBoardShortcutMapping)) {
        if (await isRegistered(shortcut)) {
            await unregister(shortcut);
        }
    }
}

export default setupKeyboardShortcuts;
