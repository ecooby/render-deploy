export declare class AuthService {
    constructor();
    register(username: string, password: string): Promise<{
        id: string;
        username: string;
    }>;
    login(username: string, password: string): Promise<{
        id: any;
        username: any;
    }>;
    guest(): Promise<{
        id: string;
        username: string;
        isGuest: boolean;
    }>;
    getUserById(userId: string): Promise<{
        id: any;
        username: any;
        isGuest: boolean;
    } | null>;
    getPlayerStats(userId: string): Promise<any>;
}
export declare const authService: AuthService;
//# sourceMappingURL=AuthService.d.ts.map