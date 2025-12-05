import gc from "@sg/game-client-base";
import { _decorator, Component, Label, Node, Sprite, SpriteAtlas } from "cc";
import { SpecialSymbol } from "db://shared-cluster-cascading/cascading-slot-utils";
import Observer from "observer";
import { FreeSpinData } from "../bet-history/bet-details/cascading-ticket-detail-item";
const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

@ccclass
export class CascadingTumbleItem extends Component {
    @property(Label)
    numberIcon: Label = null;

    @property(Sprite)
    symbol: Sprite = null;

    @property(Label)
    winningValue: Label = null;

    @property(Label)
    scatterPayout: Label = null;

    @property(SpriteAtlas)
    mainAtlas: SpriteAtlas = null;

    @property(Node)
    impormationNode: Node = null;

    @property(Node)
    closeTooltip: Node = null;

    @property(Label)
    impormationValue: Label = null;

    private multiplier: number = 0;
    private win: number = 0;
    protected prefixSymbol = "symbol-";

    setData(icon: number, count: number, win: number , multiplier: number) {
        this.numberIcon.string = count.toString();
        this.winningValue.string = gc.FormatUtils.numberWithCommas(win, 2, false);
        this.symbol.spriteFrame = this.mainAtlas.getSpriteFrame(`${this.prefixSymbol}${icon}`);
        this.multiplier = multiplier;
        this.win = win;
    }

    setDataForFreeSpinTumble(data: FreeSpinData) {
        if (data.win > 0 && this.scatterPayout) {
            this.scatterPayout.node.active = true;
            this.scatterPayout.string = gc.FormatUtils.numberWithCommas(data.win, 2, false);
        }
        const freeSpinTxt = data.extraFreeSpin ? "extra_free_spin" : "free_spin";
        this.numberIcon.string = data.count.toString();
        this.winningValue.string = data.odds.toString() + ` ${gc.Translator.gameTranslate(freeSpinTxt)}`;
        this.winningValue.node.active = data.odds > 0;
        this.symbol.spriteFrame = this.mainAtlas.getSpriteFrame(`${this.prefixSymbol}${SpecialSymbol.SCATTER_SYMBOL}`);
    }

    handleShowImpormation() {
        this.impormationNode.active = !this.impormationNode.active;
        this.closeTooltip.active = !this.closeTooltip.active;
        this.impormationValue.string = `${gc.FormatUtils.numberWithCommas(this.win, 2, false)} x ${this.multiplier}`;
    }
    handleClickCloseTooltip() {
        this.impormationNode.active = false;
        this.closeTooltip.active = false;
    }
}
