const fs = require('fs');
const os = require('os');
const path_ = require("path");
const _ = require('lodash');
const crypto = require('crypto')

module.exports = async (path) => {
    if (!fs.existsSync(path)) {
        return [];
    }

    if (fs.lstatSync(path).isDirectory()) {
        const files = fs.readdirSync(path).map(file => {
            let lstat = fs.lstatSync(path_.join(path, file));
            const is_directory = lstat.isDirectory();

            let type = 'folder';

            if (!is_directory) {
                type = path_.extname(file).replace('.', '').toLowerCase()

                if (!type) {
                    type = file.replace('.', '').toLowerCase()
                }
            }

            const file_path = path_.join(path, file);
            return {
                absolute: crypto.createHash('md5').update(file_path).digest("hex"),
                name: file,
                is_directory,
                type,
                file_path,
            }
        });
        let {true: folders, false: allFiles} = _.groupBy(files, file => file.is_directory);

        folders = _.sortBy(folders, ['name'])
        allFiles = _.sortBy(allFiles, ['name'])

        return folders.concat(allFiles);
    }

    return fs.readFileSync(path, 'utf-8')
}