
import type { Utils as UtilsType } from './utils';

declare global {
    export namespace Editor {
        export const Utils = UtilsType;
    }
}
