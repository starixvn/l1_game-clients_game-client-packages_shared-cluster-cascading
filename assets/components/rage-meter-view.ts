import { _decorator, Node, UITransform } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { RageMeterStore } from "../stores/rage-meter-store";

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass("RageMeterView")
export class RageMeterView extends ObserverComponent {
    @property(Node)
    meterBG: Node = null; // node có bg-stage

    @property(Node)
    fillMask: Node = null; // node có Mask, dùng để cắt 4 stage fill

    @property(Node)
    fillContainer: Node = null; // parent chứa 4 sprite stage (đã layout sẵn trong editor)

    private currentStage = 0;
    private isReady = false;

    onLoad(): void {
        super.onLoad();

        // đảm bảo fillMask có anchor (0, 0.5) & width = 0 lúc đầu
        const maskTf = this.fillMask?.getComponent(UITransform);
        if (maskTf) {
            maskTf.setAnchorPoint(0, 0.5);
            maskTf.width = 0;
        }

        // FillContainer anchor (0, 0.5), position (0,0) nếu cần
        const containerTf = this.fillContainer?.getComponent(UITransform);
        if (containerTf) {
            containerTf.setAnchorPoint(0, 0.5);
            this.fillContainer.setPosition(0, 0, 0);
        }

        this.isReady = true;
    }

    @render(RageMeterStore, (store) => store.progress, { fireImmediately: true })
    private onProgressChanged(progress: number) {
        console.log(`[RageMeterView] Progress changed: ${progress}`);
        if (!this.isReady) {
            return;
        }
        if (!this.meterBG || !this.fillMask) {
            return;
        }

        const bgTf = this.meterBG.getComponent(UITransform);
        const maskTf = this.fillMask.getComponent(UITransform);
        if (!bgTf || !maskTf) {
            return;
        }

        const fullWidth = bgTf.width;
        maskTf.width = fullWidth * progress; // 0..1
    }

    /**
     * Lắng nghe thay đổi stage để play anim / SFX, hoặc bật HUD…
     */
    @render(RageMeterStore, (store) => store.stage, { fireImmediately: true })
    private onStageChanged(stage: number) {
        if (!this.isReady) {
            return;
        }

        // stage up → play effect
        if (stage > this.currentStage) {
            this.playStageUpAnim(stage);
        }

        this.currentStage = stage;
    }

    private playStageUpAnim(stage: number) {
        // TODO: tween, spine, sound...
        // ví dụ đơn giản:
        // gc.Audio.play("rage_stage_" + stage);
        // hoặc tween(this.node).to(...).start();
        console.log("[RageMeterView] Stage up:", stage);
    }
}
