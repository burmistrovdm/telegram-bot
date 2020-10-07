import fs = require('fs');
import path = require('path');

export function checkExistsWithTimeout(filePath: string, timeout: number) {
    const dir = path.dirname(filePath);
    const basename = path.basename(filePath);

    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            watcher.close();
            reject(new Error('File did not exists and was not created during the timeout.'));
        }, timeout);

        fs.access(filePath, fs.constants.R_OK, (err) => {
            if (!err) {
                clearTimeout(timer);
                watcher.close();
                resolve();
            }
        });

        const watcher = fs.watch(dir, (eventType, filename) => {
            if (eventType === 'rename' && filename === basename) {
                clearTimeout(timer);
                watcher.close();
                resolve();
            }
        });
    });
}
