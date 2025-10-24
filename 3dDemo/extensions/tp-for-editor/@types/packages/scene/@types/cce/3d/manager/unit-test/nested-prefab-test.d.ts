import { SceneFacadeManager } from '../../../../../source/script/3d/facade/scene-facade-manager';
import { IUnitTest } from '../../../../../source/script/3d/manager/unit-test/unit-test-interface';
declare class NestedPrefabTest implements IUnitTest {
    test(sceneFacadeMgr: SceneFacadeManager): Promise<boolean>;
    clear(): Promise<boolean>;
}
declare const nestedPrefabTest: NestedPrefabTest;
export { nestedPrefabTest };
//# sourceMappingURL=nested-prefab-test.d.ts.map