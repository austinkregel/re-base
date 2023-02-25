const fs = require('fs');
const os = require('os');
const path_ = require("path");
const _ = require('lodash');
const crypto = require('crypto')

const getFileObject = (path) => {
    const lstat = fs.lstatSync(path);
    const is_directory = lstat.isDirectory();
    let type = 'folder';

    if (!is_directory) {
        type = path_.extname(path).replace('.', '').toLowerCase()

        if (!type) {
            type = path.replace('.', '').toLowerCase()
        }
    }

    const parts = path.split('/');
    const name = parts[parts.length - 1];

    return {
        absolute: crypto.createHash('md5').update(path).digest("hex"),
        name,
        is_directory,
        type,
        file_path: path,
        executable: !is_directory && (lstat.mode & fs.constants.S_IXUSR) > 0
    }
}

module.exports = async (path) => {
    if (!fs.existsSync(path)) {
        console.log('[!] path does not exist', path)
        return [];
    }

    if (fs.lstatSync(path).isDirectory()) {
        const files = fs.readdirSync(path).map(file => {
            const file_path = path_.join(path, file);
            return getFileObject(file_path);
        });
        let {true: folders, false: allFiles} = _.groupBy(files, file => file.is_directory);

        folders = _.sortBy(folders, ['name'])
        allFiles = _.sortBy(allFiles, ['name'])

        return {
            files: folders.concat(allFiles),
            file: getFileObject(path)
        };
    }

    return {
        data: fs.readFileSync(path, 'utf-8'),
        file: getFileObject(path)
    }
}