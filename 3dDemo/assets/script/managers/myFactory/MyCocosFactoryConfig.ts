import { CocosUiItem, CocosUiItemFactoryDrive } from "db://xhgame_plugin/sample/items/CocosUiItem"
import { CocosTextUiItem, CocosTextUiItemFactoryDrive } from "db://xhgame_plugin/sample/items/CocosTextUiItem"
import { CocosUnitUiItem, CocosUnitUiItemFactoryDrive } from "db://xhgame_plugin/sample/items/CocosUnitUiItem"
import { CocosEffectItem, CocosEffectItemFactoryDrive } from "db://xhgame_plugin/sample/items/CocosEffectItem"
import { CocosTiledItem, CocosTiledItemFactoryDrive } from "db://xhgame_plugin/sample/items/CocosTiledItem"
import { IFactoryConfig } from "@aixh-cc/xhgame_ec_framework"
import { EffectItemFactory, FactoryType, TextUiItemFactory, TiledItemFactory, UiItemFactory, UnitItemFactory, UnitUiItemFactory } from "./MyFactorys"
import { CocosUnitItem, CocosUnitItemFactoryDrive } from "db://xhgame_plugin/sample/items/CocosUnitItem"

export class MyCocosFactoryConfig implements IFactoryConfig {
    [FactoryType.unitItem]: UnitItemFactory<CocosUnitItemFactoryDrive, CocosUnitItem> = (new UnitItemFactory<CocosUnitItemFactoryDrive, CocosUnitItem>()).setItemProduceDrive(new CocosUnitItemFactoryDrive());
    [FactoryType.uiItem]: UiItemFactory<CocosUiItemFactoryDrive, CocosUiItem> = (new UiItemFactory<CocosUiItemFactoryDrive, CocosUiItem>()).setItemProduceDrive(new CocosUiItemFactoryDrive());
    [FactoryType.textUiItem]: TextUiItemFactory<CocosTextUiItemFactoryDrive, CocosTextUiItem> = (new TextUiItemFactory<CocosTextUiItemFactoryDrive, CocosTextUiItem>()).setItemProduceDrive(new CocosTextUiItemFactoryDrive());
    [FactoryType.unitUiItem]: UnitUiItemFactory<CocosUnitUiItemFactoryDrive, CocosUnitUiItem> = (new UnitUiItemFactory<CocosUnitUiItemFactoryDrive, CocosUnitUiItem>()).setItemProduceDrive(new CocosUnitUiItemFactoryDrive());
    [FactoryType.effectItem]: EffectItemFactory<CocosEffectItemFactoryDrive, CocosEffectItem> = (new EffectItemFactory<CocosEffectItemFactoryDrive, CocosEffectItem>()).setItemProduceDrive(new CocosEffectItemFactoryDrive());
    [FactoryType.tiledItem]: TiledItemFactory<CocosTiledItemFactoryDrive, CocosTiledItem> = (new TiledItemFactory<CocosTiledItemFactoryDrive, CocosTiledItem>()).setItemProduceDrive(new CocosTiledItemFactoryDrive());
}

