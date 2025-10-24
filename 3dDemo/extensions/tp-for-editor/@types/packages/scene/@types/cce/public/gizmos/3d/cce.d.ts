import GizmoManager from '../../../../../source/script/public/gizmos/3d/gizmo-manager';
declare class gizmoExport {
    init(): void;
}
declare const _default: gizmoExport;
export default _default;
declare global {
    export namespace cce {
        namespace gizmos {
            const ControllerBase: typeof import('../../../../../source/script/public/gizmos/3d/elements/controller/controller-base')['default'];
            const PositionController: typeof import('../../../../../source/script/public/gizmos/3d/elements/controller/position-controller')['default'];
            const BoxController: typeof import('../../../../../source/script/public/gizmos/3d/elements/controller/box-controller')['default'];
            const ControllerUtils: typeof import('../../../../../source/script/public/gizmos/3d/elements/utils/controller-utils')['default'];
            const GizmoDefines: typeof import('../../../../../source/script/public/gizmos/3d/gizmo-defines')['default'];
            const Gizmo: typeof import('../../../../../source/script/public/gizmos/3d/elements/gizmo-base')['default'];
            const TransformGizmo: typeof import('../../../../../source/script/public/gizmos/3d/elements/transform/transform-gizmo')['default'];
            const EngineUtils: typeof import('../../../../../source/script/public/gizmos/utils/engine/3d')['default'];
            const Utils: typeof import('../../../../../source/script/public/gizmos/utils/3d')['default'];
            const transformTool: typeof GizmoManager.transformTool;
        }
    }
}
//# sourceMappingURL=cce.d.ts.map