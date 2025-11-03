export namespace GameServiceMessageCascading {
    export class CascadingSlotFinish {
        roundId: number;
        win: number;
        actualBetWin: number;

        totalFreeSpins: number;
        freeSpins: number;

        bigWin: boolean;
        isFreeSpin: boolean;
        reachMaxWin: boolean;
        tumbles: NewTumble[];
        static eventName = "finish";
    }

    export interface NewTumble {
        newSymbols: number[][];
        reelMultipliers: number[][];
        reels: number[][];
        symbols: WinCluster[];
        win: number;
        rageMeter: number;

        rageStages?: boolean[]; //unused
        triggeredStage?: number;
        triggeredPositions?: { x: number, y: number, symbol?: number }[];
    }

    export interface WinCluster {
        symbol: number;
        position: {
            x: number;
            y: number;
        }[];
        count: number;
        multiplier: number;
        odds: number;
        win: number;
    }


    interface FreeSpinOddsDetail {
        count: number;
        odds: number;
    }

    interface FreeSpinOdds {
        initialOdds: Array<FreeSpinOddsDetail>;
        additionalOdds: Array<FreeSpinOddsDetail>;
    }

    export interface Odd {
        from: number;
        to: number;
        odds: number;
    }

    export interface OddsConfig {
        freeSpins: FreeSpinOdds;
        symbols: Record<string, Array<Odd>>;
    }

    export class CascadingSlotConfigsMsg {
        defaultCoinValue: number;
        betLevels: number[];
        betMultiplier: number;
        coinValues: number[];
        maxWinPerRound: number;
        odds: OddsConfig;
        totalMultiplier: number;
        bigWinRange: number[];

        static eventName = "gameConfigs";
    }

    export class CascadingTotalMultiplierMsg {
        totalMultiplier: number;
        static eventName = "totalMultiplier";
    }

    export class CascadingFreeSpinsMsg {
        total: number;
        betLevel: number;
        coinValue: number;
        betMultiplier: number;
        promotionId: string;
        static eventName = "freeSpins";
    }

    export class CascadingTrialUserMsg {
        balance: number;
        rate: number;
        multiplier: number;
        static eventName = "trialUser";
    }

    export class GameInfoMsg {
        volatility: number;
        static eventName = "gameInfo";
    }

    export interface BetDetailData {
        id: number;
        time: string;
        betLevel: string;
        coinValue: number;
        totalAmount: number;
        betwin: number;
        freeSpin: boolean;
        buyFreeSpin: boolean;
        reachMaxWin: boolean;
        settlementResult: SettlementResultDetail;
        totalMultiplier: number;
        multiplier: number;
        buyFreeSpinRefRoundId: any;
        totalTumbleWin: number;
    }

    export interface TumbleDetail {
        explodedSymbols?: number[];
        newSymbols?: number[];
        icons: {
            [key: number]: {
                count: number;
                odds: number;
                win: number;
            };
        };
        win: number;
        multipliers: number[];
        newBoard: string;
        originalBoard: string;
    }

    export interface SettlementResultDetail {
        tumbles: TumbleDetail[];
        freeSpins: {
            count: number;
            odds: number;
            win: number;
        };
    }
}

export interface Settlement {
    explode: number[];
    new: number[];
}

export interface Tumble {
    icons: any;
    win: number;
    settlement: Settlement;
    result: string;
    multipliers: number[];
}

export enum RageStage {
    RAGE_1 = 1,
    RAGE_2 = 2,
    RAGE_3 = 3,
    RAGE_4 = 4,
}
