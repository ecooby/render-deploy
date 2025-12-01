"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const uuid_1 = require("uuid");
const DatabaseService_1 = require("./DatabaseService");
class AuthService {
    constructor() {
        console.log('AuthService initialized');
    }
    async register(username, password) {
        const existingUser = await DatabaseService_1.databaseService.getUserByUsername(username);
        if (existingUser) {
            throw new Error('User already exists');
        }
        const userId = (0, uuid_1.v4)();
        // In production, use bcrypt to hash password!
        await DatabaseService_1.databaseService.createUser(userId, username, password, false);
        return { id: userId, username };
    }
    async login(username, password) {
        const user = await DatabaseService_1.databaseService.getUserByUsername(username);
        if (!user || user.password !== password) {
            throw new Error('Invalid credentials');
        }
        // Update last login
        await DatabaseService_1.databaseService.updateLastLogin(user.id);
        return { id: user.id, username: user.username };
    }
    async guest() {
        const guestId = `guest_${(0, uuid_1.v4)().substring(0, 8)}`;
        const guestUsername = `Guest_${Math.floor(Math.random() * 10000)}`;
        // Create guest user in database
        await DatabaseService_1.databaseService.createUser(guestId, guestUsername, '', true);
        return {
            id: guestId,
            username: guestUsername,
            isGuest: true
        };
    }
    async getUserById(userId) {
        const user = await DatabaseService_1.databaseService.getUserById(userId);
        if (!user)
            return null;
        return { id: user.id, username: user.username, isGuest: user.is_guest === 1 };
    }
    async getPlayerStats(userId) {
        return await DatabaseService_1.databaseService.getPlayerStats(userId);
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=AuthService.js.map