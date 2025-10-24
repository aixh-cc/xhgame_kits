import { IOptions } from '../../../../source/editor-extends/utils/serialize/parser';
export declare function serialize(obj: Exclude<any, null | undefined>, options?: IOptions): string | object;
export declare namespace serialize {
    var asAsset: typeof import("../../../../source/editor-extends/utils/serialize/dynamic-builder").asAsset;
    var setName: typeof import("../../../../source/editor-extends/utils/serialize/dynamic-builder").setName;
    var findRootObject: typeof import("../../../../source/editor-extends/utils/serialize/dynamic-builder").findRootObject;
}
export declare function serializeCompiled(obj: Exclude<any, null | undefined>, options: IOptions): string | object;
export declare namespace serializeCompiled {
    var getRootData: typeof import("../../../../source/editor-extends/utils/serialize/compiled/builder").getRootData;
    var packJSONs: typeof import("../../../../source/editor-extends/utils/serialize/compiled/pack-jsons").default;
}
//# sourceMappingURL=index.d.ts.map