import { ISceneMouseEvent } from '../../../../../../private';
import { ModeBase } from '../../../../../../../source/script/3d/manager/camera/2d/mode/mode-base';
declare class PanMode extends ModeBase {
    private _panningSpeed;
    enter(): Promise<void>;
    exit(): Promise<void>;
    onMouseMove(event: ISceneMouseEvent): boolean;
}
export { PanMode };
//# sourceMappingURL=pan-mode.d.ts.map