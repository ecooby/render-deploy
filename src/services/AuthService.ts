import { v4 as uuidv4 } from 'uuid';
import { databaseService } from './DatabaseService';

export class AuthService {
  constructor() {
    console.log('AuthService initialized');
  }

  async register(username: string, password: string) {
    const existingUser = await databaseService.getUserByUsername(username);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const userId = uuidv4();
    // In production, use bcrypt to hash password!
    await databaseService.createUser(userId, username, password, false);

    return { id: userId, username };
  }

  async login(username: string, password: string) {
    const user: any = await databaseService.getUserByUsername(username);
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await databaseService.updateLastLogin(user.id);

    return { id: user.id, username: user.username };
  }

  async guest() {
    const guestId = `guest_${uuidv4().substring(0, 8)}`;
    const guestUsername = `Guest_${Math.floor(Math.random() * 10000)}`;

    // Create guest user in database
    await databaseService.createUser(guestId, guestUsername, '', true);

    return {
      id: guestId,
      username: guestUsername,
      isGuest: true
    };
  }

  async getUserById(userId: string) {
    const user: any = await databaseService.getUserById(userId);
    if (!user) return null;
    return { id: user.id, username: user.username, isGuest: user.is_guest === 1 };
  }

  async getPlayerStats(userId: string) {
    return await databaseService.getPlayerStats(userId);
  }
}

export const authService = new AuthService();
