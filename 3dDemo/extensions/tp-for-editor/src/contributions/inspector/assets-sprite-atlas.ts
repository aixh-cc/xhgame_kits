'use strict';

import { dir } from "console";
import { rename, writeFile } from "fs-extra";
import { readFile } from "fs/promises";
import { basename, dirname, join } from "path";

interface Asset {
    displayName: string;
    file: string;
    imported: boolean;
    importer: string;
    invalid: boolean;
    isDirectory: boolean;
    library: {
        [extname: string]: string;
    };
    name: string;
    url: string;
    uuid: string;
    visible: boolean;
    subAssets: {
        [id: string]: Asset;
    };
}

interface Meta {
    files: string[];
    imported: boolean;
    importer: string;
    subMetas: {
        [id: string]: Meta;
    };
    userData: {
        [key: string]: any;
    };
    uuid: string;
    ver: string;
}

type Selector<$> = { $: Record<keyof $, any | null> } & { dispatch(str: string): void, assetList: Asset[], metaList: Meta[] };

export const $ = {
    'textureNameInput': '.textureNameInput',
    'okBtn': '.okBtn'
};

export const template = `
<ui-prop>
    <ui-input class="textureNameInput" value="" @change="onChange($event.target.value)"></ui-input>
</ui-prop>
<ui-prop>
    <ui-button class="okBtn" disabled>确定</ui-button>
</ui-prop>
`;
type PanelThis = Selector<typeof $>;

export function update(this: PanelThis, assetList: Asset[], metaList: Meta[]) {
    this.assetList = assetList;
    this.metaList = metaList;

    let filePath = metaList[0].userData.atlasTextureName;
    let orginName = basename(filePath, '.png');

    this.$.textureNameInput.setAttribute('placeholder', "更改合图的名称(只能包含字母、数字)");
};

export function ready(this: PanelThis) {
    this.$.textureNameInput.addEventListener('change', () => {
        let inputName = this.$.textureNameInput.value;
        this.$.okBtn.disabled = inputName.length == 0;
    });
    this.$.textureNameInput.addEventListener('confirm', async () => {
        let inputName = this.$.textureNameInput.value;
        if(inputName.length == 0){
            console.error("请输入合图的名称");
        }
        // 只能包含字母、数字
        let reg = /^[A-Za-z0-9]*$/;
        if(reg.test(inputName) == false){
            console.error("合图的名称只能包含字母、数字");
            return
        }

        let selectedType = Editor.Selection.getLastSelectedType()
        if(selectedType.length == 0){
            return;
        }
        let select = Editor.Selection.getSelected(selectedType);
        if(select.length == 0){
            return;
        }
        // console.log("select", select);
        let uuid = select[0];
        let ret = await Editor.Message.request('asset-db', 'query-asset-info', uuid);
        if(ret == null){
            return;
        }

        const orginName = basename(ret.file, ".plist");
        const plistFilePath = ret.file;
        const plistDir = dirname(plistFilePath);
        const pngFilePath = plistFilePath.replace('.plist', '.png');
        
        const newPlistFilePath = join(plistDir, inputName + '.plist');
        const newPngFilePath = join(plistDir, inputName + '.png');
        const newPngUrl = ret.url.replace(orginName + '.png', inputName + '.png');
        const newPlistUrl = ret.url.replace(orginName + '.plist', inputName + '.plist');

        // 修改png文件的名称
        await rename(pngFilePath, newPngFilePath);
        await rename(pngFilePath + ".meta", newPngFilePath + ".meta");

        // 修改plist文件的名称
        await rename(plistFilePath, newPlistFilePath);
        await rename(plistFilePath + ".meta", newPlistFilePath + ".meta");

        // 修改plist的meta文件中的合图名称
        let metaFilePath = newPlistFilePath + ".meta";
        let metaContent = await readFile(metaFilePath, 'utf8');
        metaContent = metaContent.replace(orginName, inputName);
        await writeFile(metaFilePath, metaContent);

        // 修改plist文件中的合图名称
        let content = await readFile(newPlistFilePath, 'utf8');
        let arr = content.split('\n');
        for(let i=0; i<arr.length; i++){
            let str = arr[i];
            if(str.indexOf("realTextureFileName") != -1 || str.indexOf("textureFileName") != -1){
                arr[i+1] = `    <string>${inputName}.png</string>`
                break;
            }
        }
        let newContent = ""
        for(let i=0; i<arr.length; i++){
            if(i == arr.length - 1){
                newContent += arr[i];
            }
            else{
                newContent += arr[i] + '\n';
            }
        }
        await writeFile(newPlistFilePath, newContent);

        await Editor.Message.request('asset-db', 'refresh-asset', newPngUrl);
        await Editor.Message.request('asset-db', 'refresh-asset', newPlistUrl);
    });
};

export function close(his: PanelThis, ) {
    // TODO something
};