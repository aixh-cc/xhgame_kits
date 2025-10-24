import { CameraComponent } from 'cc';
import { ISceneEvents } from '../../../../../../source/script/3d/manager/scene-events-interface';
import { PreviewBase } from '../../../../../../source/script/3d/manager/preview/preview-base';
/**
 * Scene Preview is **DETACH SCENE CAMERA**
 * > don't use it preview Scene
 */
export declare class ScenePreview extends PreviewBase implements ISceneEvents {
    device: any;
    width: number;
    height: number;
    init(registerName: string, queryName: string): void;
    onComponentAdded(comp: CameraComponent): void;
    detachSceneCameras(): void;
}
declare const scenePreview: ScenePreview;
export { scenePreview };
//# sourceMappingURL=index.d.ts.map