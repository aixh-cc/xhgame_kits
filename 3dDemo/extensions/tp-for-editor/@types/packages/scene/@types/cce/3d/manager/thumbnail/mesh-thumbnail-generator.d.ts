import { BaseThumbnailGenerator } from '../../../../../source/script/3d/manager/thumbnail/thumbnail-generator-interface';
declare class MeshThumbnailGenerator extends BaseThumbnailGenerator {
    private _mesh;
    private _queue;
    private _queueLock;
    constructor();
    getThumbnail(uuid: string, path: string): Promise<string>;
    private step;
    private generate;
}
export default MeshThumbnailGenerator;
//# sourceMappingURL=mesh-thumbnail-generator.d.ts.map