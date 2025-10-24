import { MaterialPreview } from '../../../../../source/script/3d/manager/material-preview';
import { MeshPreview } from '../../../../../source/script/3d/manager/mesh-preview';
import { MiniPreview } from '../../../../../source/script/3d/manager/mini-preview';
import { ModelPreview } from '../../../../../source/script/3d/manager/model-preview';
import { SkeletonPreview } from '../../../../../source/script/3d/manager/skeleton-preview';
import { MotionPreview } from '../../../../../source/script/3d/manager/animation-graph-preview/motion';
import { TransitionPreview } from '../../../../../source/script/3d/manager/animation-graph-preview/transition';
import { PreviewBase } from '../../../../../source/script/3d/manager/preview/preview-base';
export declare class PreviewManager {
    _previewMgrMap: Map<string, PreviewBase>;
    scenePreview: import("../../../../../source/script/3d/manager/preview/scene-preview").ScenePreview;
    materialPreview: MaterialPreview;
    miniPreview: MiniPreview;
    modelPreview: ModelPreview;
    meshPreview: MeshPreview;
    skeletonPreview: SkeletonPreview;
    motionPreview: MotionPreview;
    transitionPreview: TransitionPreview;
    _electronIPC: any;
    init(): void;
    private initPreview;
    queryPreviewData(previewName: string, info: any): Promise<any>;
    callPreviewFunction(previewName: string, funcName: string, ...args: any[]): Promise<any>;
    private _register;
}
declare const previewMgr: PreviewManager;
export { previewMgr };
//# sourceMappingURL=index.d.ts.map