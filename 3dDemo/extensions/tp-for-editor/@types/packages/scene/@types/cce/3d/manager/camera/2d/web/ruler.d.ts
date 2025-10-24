import Grid from '../../../../../../../source/script/3d/manager/camera/grid';
import { IRuler } from '../../../../../../../source/script/3d/manager/camera/2d/ruler-interface';
declare class Ruler implements IRuler {
    hRulerCanvas: HTMLCanvasElement;
    vRulerCanvas: HTMLCanvasElement;
    hRulerCtx: CanvasRenderingContext2D;
    vRulerCtx: CanvasRenderingContext2D;
    rulerLen: number;
    isShow: boolean;
    init(): void;
    show(isShow: boolean): void;
    updateTicks(grid: Grid): void;
    valueToPixelH(x: number, grid: Grid): number;
    valueToPixelV(y: number, grid: Grid): any;
    resize(width: number, height: number): void;
}
export { Ruler };
//# sourceMappingURL=ruler.d.ts.map