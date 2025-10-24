import { Scene } from 'cc';
import { InteractivePreview } from '../../../../../source/script/3d/manager/preview/Interactive-preview';
declare class SkeletonPreview extends InteractivePreview {
    private lightComp;
    private _jointMap;
    init(registerName: string, queryName: string): void;
    createNodes(scene: Scene): void;
    setSkeleton(uuid: string): Promise<{
        jointCount: number;
    } | null>;
    setLightEnable(enable: boolean): void;
    resetCamera(): void;
}
export { SkeletonPreview };
//# sourceMappingURL=index.d.ts.map