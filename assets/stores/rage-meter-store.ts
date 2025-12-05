import inversify from "inversify";
import mobx from "mobx";
import { CascadingUIStore } from "./cascading-ui-store";

const { injectable, inject } = inversify;

export type RageStage = 0 | 1 | 2 | 3 | 4;

@injectable()
export class RageMeterStore {
    @inject(CascadingUIStore) protected readonly uiStore: CascadingUIStore;
    constructor() {
        mobx.makeAutoObservable(this);
    }
    public value = 0; // raw từ backend
    public thresholds: number[] = [12, 25, 40, 60];

    public stage: RageStage = 0; // 0..4
    public progress = 0; // 0..1 (fill toàn thanh)
    public lastStage: RageStage = 0;

    // mode
    public isFreeSpinSession = false;

    // dùng cho trường hợp Stage 4 trong FS nhưng muốn reset sau anim
    public pendingStage4Reset = false;

    updateFromBackend(raw: number) {
        const max = this.thresholds[3]; // 60
        let effective = raw;

        if (this.uiStore.isFreeSpins) {
            // ------------ FREE SPINS MODE ------------

            // 1) detect Stage 4 (dựa trên raw tổng)
            if (raw >= max && this.lastStage < 4) {
                this.pendingStage4Reset = true; // nếu bạn cần xử lý sau anim
            }

            // 2) convert accumulated (1..N) -> meter value (1..60)
            if (raw > max) {
                effective = raw % max; // 65 % 60 = 5
                if (effective === 0) {
                    effective = max; // 120 % 60 = 0 -> 60
                }
            }
        } else {
            effective = Math.max(0, Math.min(raw, max));
        }

        // 3) update state chung cho cả 2 mode
        this.value = effective;
        this.lastStage = this.stage;
        this.stage = this.calculateStage(effective);
        this.progress = effective / max;
    }

    reset() {
        this.value = 0;
        this.lastStage = 0;
        this.stage = 0;
        this.progress = 0;
        this.pendingStage4Reset = false;
    }

    confirmStage4ResolvedIfNeeded() {
        if (this.uiStore.isFreeSpins && this.pendingStage4Reset) {
            this.reset(); // reset meter về 0
            this.pendingStage4Reset = false;
        }
    }

    private calculateStage(value: number): RageStage {
        const [s1, s2, s3, s4] = this.thresholds;
        if (value >= s4) {
            return 4;
        }
        if (value >= s3) {
            return 3;
        }
        if (value >= s2) {
            return 2;
        }
        if (value >= s1) {
            return 1;
        }
        return 0;
    }
}
