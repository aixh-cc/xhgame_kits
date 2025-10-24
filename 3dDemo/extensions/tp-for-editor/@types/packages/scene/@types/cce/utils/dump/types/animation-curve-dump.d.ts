import { IProperty } from '../../../../public';
import { DumpInterface } from '../../../../../source/script/utils/dump/types/dump-interface';
import * as cc from 'cc';
declare class AnimationCurveDump implements DumpInterface {
    encode(object: any, data: IProperty, opts?: any): void;
    decode(data: cc.CurveRange, info: any, dump: any, opts?: any): void;
}
export declare const animationCurveDump: AnimationCurveDump;
export { };
//# sourceMappingURL=animation-curve-dump.d.ts.map