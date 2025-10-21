import { IAssetDrive, IBundle } from "@aixh-cc/xhgame_ec_framework"

class TestBundle implements IBundle {
    nameOrUrl: string
    constructor(nameOrUrl: string) {
        this.nameOrUrl = nameOrUrl
    }
    loadDir(dir: string, onProgress: ((finished: number, total: number, item: any) => void) | null, onComplete: (err: Error | null, data: any[]) => void): void {
        let finished = 100
        let total = 100
        let item = {}
        onProgress(finished, total, item)
        let items = []
        onComplete(null, items)
    }
}
export class TestAssetDrive implements IAssetDrive {
    loadBundle(nameOrUrl: string, onComplete: (err: Error, data: IBundle) => void) {
        let err = null
        let data = new TestBundle('nameOrUrl');
        onComplete(err, data)
    }
}