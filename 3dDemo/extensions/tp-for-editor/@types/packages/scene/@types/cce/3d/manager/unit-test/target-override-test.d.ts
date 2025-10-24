import type { SceneFacadeManager } from '../../../../../source/script/3d/facade/scene-facade-manager';
import { IUnitTest } from '../../../../../source/script/3d/manager/unit-test/unit-test-interface';
declare class TargetOverrideTest implements IUnitTest {
    test(sceneFacadeMgr: SceneFacadeManager): Promise<boolean>;
    clear(): Promise<boolean>;
}
declare const targetOverrideTest: TargetOverrideTest;
export { targetOverrideTest };
//# sourceMappingURL=target-override-test.d.ts.map