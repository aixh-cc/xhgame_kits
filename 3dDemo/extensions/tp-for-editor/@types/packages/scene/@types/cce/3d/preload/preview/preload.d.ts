import type { CustomWebIPC } from '../../../../../source/script/3d/manager/ipc/web/ipc';
declare function check(): void;
export { check };
declare global {
    export namespace cce {
        let Ipc: CustomWebIPC;
        let Startup: typeof import('../../../../../source/script/3d/manager/startup')['default'];
        let EditorPreview: typeof import('../../../../../source/script/3d/preload/preview/editor-preview')['default'];
    }
}
//# sourceMappingURL=preload.d.ts.map