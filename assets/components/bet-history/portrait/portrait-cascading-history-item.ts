import gc from "@sg/game-client-base";
import { _decorator, Label } from 'cc';
import { CascadingHistoryItem } from '../cascading-history-item';

const { ccclass, property } = _decorator;

@ccclass
export class PortraitCascadingHistoryItem extends CascadingHistoryItem {

    @property(Label)
    haveFreeSpin: Label = null;

    onDestroy() {
        super.onDestroy();
    }
    setData(data: any) {
        super.setData(data);
        this.handleFreeSpin(data);
        if (data.betHistoryLog.betWin > 0) {
            this.time.node.getComponent(Label).color = this.textNormalColor;
            this.totalWin.node.getComponent(Label).color = this.textHighlightColor;
        } else {
            this.totalWin.node.getComponent(Label).color = this.textNormalColor;
            this.time.node.getComponent(Label).color = this.textNormalColor;
        }
    }

    private getFreeSpinText(betHistoryLog: any): string {
        switch (true) {
            case betHistoryLog.buyFreeSpin > 0:
                return "Buy Feature";
            case betHistoryLog.freeSpin:
                return "Free Spin";
            default:
                return "";
        }
    }

    handleFreeSpin(data: any) {
        const { betHistoryLog } = data;
        const freeSpinText = this.getFreeSpinText(betHistoryLog);
        this.haveFreeSpin.node.active = freeSpinText !== "";
        this.haveFreeSpin.string = freeSpinText;
    }
}


