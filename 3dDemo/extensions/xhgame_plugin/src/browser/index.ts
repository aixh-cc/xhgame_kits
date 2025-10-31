import { name } from '../../package.json' with { type: 'json' };
import { IGetPackagesRes, IGetVersionRes } from '../common/defined';
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
    }
};

export async function load() {
    console.log(`load ${name}`);
}

export function unload() {
    console.log(`unload ${name}`);
}
