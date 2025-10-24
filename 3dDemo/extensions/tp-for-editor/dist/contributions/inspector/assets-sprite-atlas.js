'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = exports.ready = exports.update = exports.template = exports.$ = void 0;
const fs_extra_1 = require("fs-extra");
const promises_1 = require("fs/promises");
const path_1 = require("path");
exports.$ = {
    'textureNameInput': '.textureNameInput',
    'okBtn': '.okBtn'
};
exports.template = `
<ui-prop>
    <ui-input class="textureNameInput" value="" @change="onChange($event.target.value)"></ui-input>
</ui-prop>
<ui-prop>
    <ui-button class="okBtn" disabled>确定</ui-button>
</ui-prop>
`;
function update(assetList, metaList) {
    this.assetList = assetList;
    this.metaList = metaList;
    let filePath = metaList[0].userData.atlasTextureName;
    let orginName = (0, path_1.basename)(filePath, '.png');
    this.$.textureNameInput.setAttribute('placeholder', "更改合图的名称(只能包含字母、数字)");
}
exports.update = update;
;
function ready() {
    this.$.textureNameInput.addEventListener('change', () => {
        let inputName = this.$.textureNameInput.value;
        this.$.okBtn.disabled = inputName.length == 0;
    });
    this.$.textureNameInput.addEventListener('confirm', async () => {
        let inputName = this.$.textureNameInput.value;
        if (inputName.length == 0) {
            console.error("请输入合图的名称");
        }
        // 只能包含字母、数字
        let reg = /^[A-Za-z0-9]*$/;
        if (reg.test(inputName) == false) {
            console.error("合图的名称只能包含字母、数字");
            return;
        }
        let selectedType = Editor.Selection.getLastSelectedType();
        if (selectedType.length == 0) {
            return;
        }
        let select = Editor.Selection.getSelected(selectedType);
        if (select.length == 0) {
            return;
        }
        // console.log("select", select);
        let uuid = select[0];
        let ret = await Editor.Message.request('asset-db', 'query-asset-info', uuid);
        if (ret == null) {
            return;
        }
        const orginName = (0, path_1.basename)(ret.file, ".plist");
        const plistFilePath = ret.file;
        const plistDir = (0, path_1.dirname)(plistFilePath);
        const pngFilePath = plistFilePath.replace('.plist', '.png');
        const newPlistFilePath = (0, path_1.join)(plistDir, inputName + '.plist');
        const newPngFilePath = (0, path_1.join)(plistDir, inputName + '.png');
        const newPngUrl = ret.url.replace(orginName + '.png', inputName + '.png');
        const newPlistUrl = ret.url.replace(orginName + '.plist', inputName + '.plist');
        // 修改png文件的名称
        await (0, fs_extra_1.rename)(pngFilePath, newPngFilePath);
        await (0, fs_extra_1.rename)(pngFilePath + ".meta", newPngFilePath + ".meta");
        // 修改plist文件的名称
        await (0, fs_extra_1.rename)(plistFilePath, newPlistFilePath);
        await (0, fs_extra_1.rename)(plistFilePath + ".meta", newPlistFilePath + ".meta");
        // 修改plist的meta文件中的合图名称
        let metaFilePath = newPlistFilePath + ".meta";
        let metaContent = await (0, promises_1.readFile)(metaFilePath, 'utf8');
        metaContent = metaContent.replace(orginName, inputName);
        await (0, fs_extra_1.writeFile)(metaFilePath, metaContent);
        // 修改plist文件中的合图名称
        let content = await (0, promises_1.readFile)(newPlistFilePath, 'utf8');
        let arr = content.split('\n');
        for (let i = 0; i < arr.length; i++) {
            let str = arr[i];
            if (str.indexOf("realTextureFileName") != -1 || str.indexOf("textureFileName") != -1) {
                arr[i + 1] = `    <string>${inputName}.png</string>`;
                break;
            }
        }
        let newContent = "";
        for (let i = 0; i < arr.length; i++) {
            if (i == arr.length - 1) {
                newContent += arr[i];
            }
            else {
                newContent += arr[i] + '\n';
            }
        }
        await (0, fs_extra_1.writeFile)(newPlistFilePath, newContent);
        await Editor.Message.request('asset-db', 'refresh-asset', newPngUrl);
        await Editor.Message.request('asset-db', 'refresh-asset', newPlistUrl);
    });
}
exports.ready = ready;
;
function close(his) {
    // TODO something
}
exports.close = close;
;
