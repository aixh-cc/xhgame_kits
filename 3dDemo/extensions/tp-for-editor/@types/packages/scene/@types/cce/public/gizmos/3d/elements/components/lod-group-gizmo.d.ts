import GizmoBase from '../../../../../../../source/script/public/gizmos/3d/elements/gizmo-base';
import LODController from '../../../../../../../source/script/public/gizmos/3d/elements/controller/lod-controller';
declare class LODGroupGizmo extends GizmoBase {
    protected _controller: LODController;
    init(): void;
    onEditorCameraMoved(): void;
    onShow(): void;
    onHide(): void;
    createController(): void;
    onControllerMouseDown(): void;
    onControllerMouseMove(): void;
    onControllerMouseUp(): void;
    updateControllerData(): void;
    updateControllerTransform(): void;
    updateController(): void;
    onTargetUpdate(): void;
    onNodeChanged(): void;
}
export default LODGroupGizmo;
//# sourceMappingURL=lod-group-gizmo.d.ts.map