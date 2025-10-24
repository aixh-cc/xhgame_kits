import { Node, Vec3 } from 'cc';
import ControllerBase from '../../../../../../../source/script/public/gizmos/3d/elements/controller/controller-base';
declare class PlaneController extends ControllerBase {
    private _planeNode;
    private _arrowNode;
    constructor(rootNode: Node);
    initShape(): void;
    updateData(center: Vec3, normal: Vec3): void;
}
export default PlaneController;
//# sourceMappingURL=plane-controller.d.ts.map