import GizmoBase from '../../../../../../../source/script/public/gizmos/3d/elements/gizmo-base';
import { RectangleController } from '../../../../../../../source/script/public/gizmos/3d/elements/controller/rectangle-controller';
declare class CanvasGizmo extends GizmoBase {
    protected _controller: RectangleController;
    init(): void;
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
export default CanvasGizmo;
//# sourceMappingURL=canvas-gizmo.d.ts.map