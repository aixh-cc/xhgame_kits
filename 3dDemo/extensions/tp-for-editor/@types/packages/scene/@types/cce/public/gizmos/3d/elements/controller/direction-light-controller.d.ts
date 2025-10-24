import ControllerBase from '../../../../../../../source/script/public/gizmos/3d/elements/controller/controller-base';
import { Node, Color } from 'cc';
declare class DirectionLightController extends ControllerBase {
    protected _lightDirNode: Node | null;
    constructor(rootNode: Node);
    setColor(color: Color): void;
    initShape(): void;
}
export default DirectionLightController;
//# sourceMappingURL=direction-light-controller.d.ts.map