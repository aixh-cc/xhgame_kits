import { Vec3, Terrain, Texture2D } from 'cc';
import { TerrainBrush, TerrainBrushType } from '../../../../../../../../source/script/public/gizmos/3d/elements/components/terrain/terrain-brush';
import { TerrainEditorMode } from '../../../../../../../../source/script/public/gizmos/3d/elements/components/terrain/terrain-editor-mode';
import { TerrainWeightUndoRedo } from '../../../../../../../../source/script/public/gizmos/3d/elements/components/terrain/terrain-operation';
export declare class TerrainEditorPaint extends TerrainEditorMode {
    _brushes: TerrainBrush[];
    _undo: TerrainWeightUndoRedo | null;
    _currentLayer: number;
    _currentBrush: TerrainBrush;
    constructor(gizmo: any);
    setCurrentBrush(type: TerrainBrushType): void;
    getCurrentBrush(): TerrainBrush;
    getBrush(type: TerrainBrushType): TerrainBrush;
    setBrushImage(tex: Texture2D | null): void;
    setCurrentLayer(layer: number): void;
    getCurrentLayer(): number;
    onUpdate(terrain: Terrain, dtime: number): void;
    onUpdateBrushPosition(terrain: Terrain, pos: Vec3): void;
    onMouseDown(terrain: Terrain): void;
    onMouseUp(): void;
    onDeactivate(): void;
    private _updateWeight;
}
//# sourceMappingURL=terrain-editor-paint.d.ts.map