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
        console.log('editer installComponent param', param)
        param.pluginName = name
        return await Handles.installComponent(param)
    },
    async uninstallComponent(param: any): Promise<IUninstallRes> {
        console.log('editer uninstallComponent param', param)
        param.pluginName = name
        return await Handles.uninstallComponent(name)
    }
};

export async function load() {
    console.log(`load ${name}`);
}

export function unload() {
    console.log(`unload ${name}`);
}
