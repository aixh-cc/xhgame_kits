import { Node } from 'cc';
import ControllerBase from '../../../../../../../source/script/public/gizmos/3d/elements/controller/controller-base';
declare class MeshController extends ControllerBase {
    private _linesNode;
    private _linesMR;
    constructor(rootNode: Node);
    initShape(): void;
    updateData(points: number[], indices: number[]): void;
}
export default MeshController;
//# sourceMappingURL=mesh-controller.d.ts.map