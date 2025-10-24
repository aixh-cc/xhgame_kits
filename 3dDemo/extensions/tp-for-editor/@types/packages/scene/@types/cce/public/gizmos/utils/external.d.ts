import EditorMath from '../../../../../source/script/utils/math';
import aabb from '../../../../../source/script/utils/aabb';
declare class External {
    NodeUtils: import("../../../../../source/script/utils/node").NodeUtils;
    EditorMath: typeof EditorMath;
    EditorCamera: import("../../../../../source/script/3d/manager/camera").Camera;
    GeometryUtils: {
        aabb: typeof aabb;
        calculateNormals: any;
    };
}
declare const external: External;
export default external;
//# sourceMappingURL=external.d.ts.map