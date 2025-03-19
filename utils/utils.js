import fs from 'fs';
import { settings } from '../settings.js';

export const getExecutable = () => {
    const os = process.platform;
    switch (os) {
        case 'darwin':
            return './browser/TitanBrowser.app/Contents/MacOS/TitanBrowser';

        case 'win32':
            return './browser/TitanBrowser.exe';

        default:
            return null;
    }
};

export const delay = (min, max) => new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

export const saveToFile = (filename, data) => {
    fs.writeFileSync('./data/' + filename, JSON.stringify(data, null, 2), 'utf8');
};

export const log = (msg, type) => {
    if (settings.SERVER_LOGS == false) return null;
    switch (type) {
        case 'error':
            console.error('[X]', msg);
            break;
        case 'warning':
            console.warn('[!]', msg);
            break;
        default:
            console.log('[*]', msg);
            break;
    }
};
