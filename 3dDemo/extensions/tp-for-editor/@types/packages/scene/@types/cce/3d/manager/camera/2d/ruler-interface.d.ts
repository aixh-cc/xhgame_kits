import Grid from '../../../../../../source/script/3d/manager/camera/grid';
interface IRuler {
    show(isShow: boolean): void;
    init(): void;
    updateTicks(grid: Grid): void;
    resize(width: number, height: number): void;
}
export { IRuler };
//# sourceMappingURL=ruler-interface.d.ts.map