import { FetchHttp, NetManager, Websocket } from "@aixh-cc/xhgame_ec_framework"
import { ApiEnums } from "./ApiEnums"

export class MyNetManager extends NetManager<FetchHttp, Websocket> {
    constructor() {
        super(new FetchHttp(), new Websocket())
    }

    get enums() {
        return ApiEnums
    }
}
