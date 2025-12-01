export declare class DatabaseService {
    private pool;
    constructor();
    private initialize;
    createUser(id: string, username: string, password: string, isGuest?: boolean): Promise<void>;
    getUserByUsername(username: string): Promise<any>;
    getUserById(id: string): Promise<any>;
    updateLastLogin(userId: string): Promise<void>;
    getPlayerStats(userId: string): Promise<any>;
    updatePlayerStats(userId: string, stats: {
        wins?: number;
        losses?: number;
        gamesPlayed?: number;
        totalDamage?: number;
        totalKills?: number;
    }): Promise<void>;
    close(): Promise<void>;
}
export declare const databaseService: DatabaseService;
//# sourceMappingURL=DatabaseService.d.ts.map