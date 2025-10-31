import inversify from "inversify";
import mobx from "mobx";
import { GameServiceMessageCascading } from "../game-messages-cascading";
const { injectable, inject } = inversify;


@injectable()
export class CascadingSlotSettlementStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }
    private _finishData: GameServiceMessageCascading.CascadingSlotFinish = null;

    get finishData() {
        return this._finishData;
    }

    set finishData(data: GameServiceMessageCascading.CascadingSlotFinish) {
        this._finishData = data;
    }
}
