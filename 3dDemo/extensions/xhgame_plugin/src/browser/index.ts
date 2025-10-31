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
    async installComponent(): Promise<IInstallInfoRes> {
        return await Handles.installComponent(name)
    },
    async uninstallComponent(): Promise<IUninstallRes> {
        return await Handles.uninstallComponent(name)
    }
};

export async function load() {
    console.log(`load ${name}`);
}

export function unload() {
    console.log(`unload ${name}`);
}
