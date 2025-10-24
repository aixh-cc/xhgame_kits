import { IProperty } from '../../../../public';
import { DumpInterface } from '../../../../../source/script/utils/dump/types/dump-interface';
declare class AssetDump implements DumpInterface {
    encode(object: any, data: IProperty, opts?: any): void;
    decode(data: any, info: any, dump: any, opts?: any): Promise<void>;
}
export declare const assetDump: AssetDump;
export { };
//# sourceMappingURL=asset-dump.d.ts.map