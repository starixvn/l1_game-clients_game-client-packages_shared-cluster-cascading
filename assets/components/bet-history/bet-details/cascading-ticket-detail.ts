import gc from "@sg/game-client-base";
import { _decorator, Button, Color, instantiate, Label, Node, Prefab, sys } from "cc";
import { GameServiceMessageCascading } from "db://shared-cluster-cascading/game-messages-cascading";
import { Dialog } from "db://shared-components/shared/common-components/dialogs/dialog";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { CascadingTotalMultiplier } from "../cascading-total-multiplier";
import { CascadingTicketDetailItem } from "./cascading-ticket-detail-item";

const { ccclass, property } = _decorator;
const { handle } = Observer;

export type BetDetailTableType = {
    model: gc.BetHistory.BetDetailModel;
    totalMultiplierPrefab: Prefab;
    detailItemPrefab: Prefab;
};

@ccclass
export class CascadingTicketDetail extends ObserverComponent {
    @property(Label)
    roundId: Label = null;

    @property(Prefab)
    prfTicketDetailItem: Prefab = null;

    @property(Prefab)
    totalMultiplierPrefab: Prefab = null;

    @property(Node)
    content: Node = null;

    @property(Node)
    multiplierNode: Node = null;

    @property(Label)
    multiplierTotal: Label = null;

    @property(Label)
    textMultiplier: Label = null;

    @property(Label)
    winTotal: Label = null;

    @property(Label)
    reachMaxText: Label = null;

    @property(Prefab)
    prfMobileTicketDetailItem: Prefab = null;

    data: any = null;

    
    setData(data: { betHistoryLog: GameServiceMessageCascading.BetDetailData }) {
        const { betHistoryLog } = data;
        if (!betHistoryLog) {
            return;
        }
        this.data = betHistoryLog;
        const freeSpin = betHistoryLog.freeSpin ?? false;
        const buyFreeSpin = betHistoryLog.buyFreeSpin ?? false;
        let roundIdText = `${betHistoryLog.id}`;
        if (buyFreeSpin) {
            roundIdText += ` (${gc.Translator.gameTranslate("buy_free_spins")})`;
        } else if (freeSpin) {
            roundIdText += ` (Free Spin)`;
        }
        this.roundId.string = roundIdText;
        const tumbles = this.handleMoveIndexTumble(betHistoryLog.settlementResult.tumbles);
        const isReachMaxWin = betHistoryLog.reachMaxWin;

        let currWinTumble = 0;

        const freeSpinsWin = this.data.settlementResult.freeSpins?.win;
        const isWinFreeSpin = this.data.settlementResult.freeSpins?.count > 0;
        let isShowNextRow = !isReachMaxWin;
        if (freeSpinsWin) {
            isShowNextRow = true;
        }
        tumbles.forEach((tumble, index) => {
            const detailItem = this.loadDetailItem();
            const control = detailItem.getComponent(CascadingTicketDetailItem);
            if ((index === tumbles.length - 1 && isShowNextRow) || index < tumbles.length - 1) {
                currWinTumble += tumble.win;
                control.setData(tumble, index, betHistoryLog, currWinTumble);
                this.content.addChild(detailItem);
            }
            const reel = tumble?.reels?.map(col => [...col].reverse()).flat().join(',') ?? '';
            const newTumbleMultipliers = tumble.reelMultipliers ?? [];
            control.setDataResultBoard(reel, newTumbleMultipliers);
            console.log('tumble', JSON.parse(JSON.stringify(tumble)))
            if (tumble.symbols.length > 0) {
                control.highlightExplodedSymbols(tumble.symbols);
            } else if (isWinFreeSpin) {
                control.highlightScatterSymbolDetail();
            } else {
                control.showNoWinBoard();
            }
        });
        this.handleMultiplierData(betHistoryLog);
        this.winTotal.string = gc.FormatUtils.numberWithCommas(betHistoryLog.betWin, 2, false);
        this.reachMaxText.node.active = isReachMaxWin;
    }

    handleMoveIndexTumble(data: any[]) {
        for (let i = 1; i < data.length; i++) {
            const current = data[i];
            const previous = data[i - 1];
            if (current.symbols?.length > 0) {
                previous.symbols = previous.symbols || [];
                previous.symbols.unshift(...current.symbols);
                current.symbols = [];
            }
            ['newSymbols', 'reelMultipliers'].forEach(key => {
                if (current[key]?.length > 0) {
                    previous[key] = previous[key] || [];
                    previous[key].push(...current[key]);
                    current[key] = [];
                }
            });
            if (current.win !== undefined) {
                previous.win = (previous.win || 0) + current.win;
                current.win = 0;
            }
            if (current.rageMeter !== undefined) {
                previous.rageMeter = current.rageMeter;
            }
        }
        
        return data;
    }


    loadDetailItem() {
        return sys.isMobile ? instantiate(this.prfMobileTicketDetailItem) : instantiate(this.prfTicketDetailItem);
    }

    handleMultiplierData(data: any) {
        let lbMulti = "";
        const freeSpin = data.freeSpin || false;
        const tumbles = data.settlementResult.tumbles;
        if (freeSpin) {
            if (data.totalMultipliers) {
                lbMulti = `total_multiplier`;
                this.multiplierTotal.string = data.totalMultiplier;
                this.multiplierTotal.node.getComponent(Label).color = this.textMultiplier.node.getComponent(Label).color = new Color(
                    66,
                    190,
                    254
                );
                this.multiplierNode.active = true;
            }
        } else {
            lbMulti = `multiplier`;
            this.multiplierTotal.string = data.multiplier;
            this.multiplierNode.active = tumbles.length > 1 && +data.multiplier > 0;
        }

        this.textMultiplier.string = `${gc.Translator.gameTranslate(lbMulti)}:`;
        const btnTextMulti = this.textMultiplier.getComponent(Button);
        const btnValueMulti = this.multiplierTotal.getComponent(Button);
        btnTextMulti.interactable = btnValueMulti.interactable = freeSpin;
    }

    @handle(gc.Audios.AudioHandler, (handle) => handle.playSFX(gc.Audios.AudioIds.CLICK))
    onClickMultiplier() {
        const totalMultiplier = instantiate(this.totalMultiplierPrefab);
        const totalControl = totalMultiplier.getComponent(CascadingTotalMultiplier);
        totalControl.setData(this.data);
        this.node.addChild(totalMultiplier);
    }

    showBetDetail(data: any) {
        this.setData(data);
        const dialog = this.getComponent(Dialog);
        if (dialog && !dialog.autoShowWhenEnable) {
            dialog.show();
        }
    }

    @handle(gc.Audios.AudioHandler, (handle) => handle.playSFX(gc.Audios.AudioIds.CLICK))
    onClickClose() {
        const dialogs = this.getComponentsInChildren(Dialog);

        if (dialogs.length > 0) {
            dialogs[0].hide();
        } else {
            this.node.destroy();
        }
    }
}
