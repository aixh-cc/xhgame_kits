import { name } from '../../package.json' with { type: 'json' };
import { IGetPackagesRes, IGetVersionRes, IInstallInfoRes, IUninstallRes } from '../common/defined';
import { Handles } from '../common/Handles';

export const methods = {
    async open() {
        return Editor.Panel.open(name);
    },
    getVersion(): IGetVersionRes {
        return {
            success: true,
            version: Editor.App.version
        };
    },
    async getPackages(): Promise<IGetPackagesRes> {
        return await Handles.getPackages(name)
    },
    async installComponent(param: any): Promise<IInstallInfoRes> {
        param.pluginName = name
        console.log('editer installComponent param', param)
        return await Handles.installComponent(param)
    },
    async uninstallComponent(param: any): Promise<IUninstallRes> {
        param.pluginName = name
        console.log('editer uninstallComponent param', param)
        return await Handles.uninstallComponent(param)
    }
};

export async function load() {
    console.log(`load ${name}`);
}

export function unload() {
    console.log(`unload ${name}`);
}
