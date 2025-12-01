import { GameState, BattleAction, Team } from '../../../shared/types';
import { BattleManager } from './BattleManager';
export declare class BotAI {
    private battleManager;
    constructor(battleManager: BattleManager);
    calculateMove(gameState: GameState, botTeam: Team): BattleAction;
}
//# sourceMappingURL=BotAI.d.ts.map