import { IAssetDrive, IBundle } from "@aixh-cc/xhgame_ec_framework"

class TestBundle implements IBundle {
    nameOrUrl: string
    constructor(nameOrUrl: string) {
        this.nameOrUrl = nameOrUrl
    }
    load() {

    }
    release(path: string): void {

    }
    loadDir(dir: string, onComplete: (err: Error | null, data: any[]) => void): void {
        let finished = 100
        let total = 100
        let item = {}
        let items = []
        console.log('loadDir', this.nameOrUrl)
        if (this.nameOrUrl == 'bundle_gate') {
            // 模拟
            if (dir == 'config') {
                console.log('模拟加载config数据')
                var fs = require('fs');
                var battledata = fs.readFileSync(__dirname + '/../../config/client/battle.json', 'utf8');
                items.push({ name: 'battle', json: JSON.parse(battledata) })
                var unitdata = fs.readFileSync(__dirname + '/../../config/client/unit.json', 'utf8');
                items.push({ name: 'unit', json: JSON.parse(unitdata) })
                var skilldata = fs.readFileSync(__dirname + '/../../config/client/skill.json', 'utf8');
                items.push({ name: 'skill', json: JSON.parse(skilldata) })
                var storedata = fs.readFileSync(__dirname + '/../../config/client/store.json', 'utf8');
                items.push({ name: 'store', json: JSON.parse(storedata) })
                var configdata = fs.readFileSync(__dirname + '/../../config/client/config.json', 'utf8');
                items.push({ name: 'config', json: JSON.parse(configdata) })
            }

        }
        onComplete(null, items)
    }
}
export class TestAssetDrive implements IAssetDrive {
    loadBundle(nameOrUrl: string, onComplete: (err: Error, data: any) => void) {
        let err = null
        let data = new TestBundle(nameOrUrl);
        onComplete(err, data)
    }
}