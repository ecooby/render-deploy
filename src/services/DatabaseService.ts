import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'sql177.lh.pl',
  user: process.env.DB_USER || 'serwer399783_atepic',
  password: process.env.DB_PASSWORD || 'gMqx=>M5VjArTMvr',
  database: process.env.DB_NAME || 'serwer399783_atepic',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: 0
};

export class DatabaseService {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool(DB_CONFIG);
    this.initialize();
  }

  private async initialize() {
    try {
      const connection = await this.pool.getConnection();
      
      // Create users table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          is_guest TINYINT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_username (username)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Create player_stats table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS player_stats (
          user_id VARCHAR(255) PRIMARY KEY,
          wins INT DEFAULT 0,
          losses INT DEFAULT 0,
          games_played INT DEFAULT 0,
          total_damage BIGINT DEFAULT 0,
          total_kills INT DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      connection.release();
      console.log('✅ MySQL Database initialized');
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      console.warn('⚠️ Server will continue without database functionality');
      // Don't throw - allow server to run without DB for guest games
    }
  }

  // User operations
  async createUser(id: string, username: string, password: string, isGuest: boolean = false) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      
      await connection.query(
        'INSERT INTO users (id, username, password, is_guest) VALUES (?, ?, ?, ?)',
        [id, username, password, isGuest ? 1 : 0]
      );

      // Create stats entry
      await connection.query(
        'INSERT INTO player_stats (user_id) VALUES (?)',
        [id]
      );
      
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getUserByUsername(username: string) {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  async getUserById(id: string) {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  async updateLastLogin(userId: string) {
    await this.pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
  }

  // Stats operations
  async getPlayerStats(userId: string) {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM player_stats WHERE user_id = ?',
      [userId]
    );
    return rows[0];
  }

  async updatePlayerStats(userId: string, stats: {
    wins?: number,
    losses?: number,
    gamesPlayed?: number,
    totalDamage?: number,
    totalKills?: number
  }) {
    const fields = [];
    const values = [];

    if (stats.wins !== undefined) {
      fields.push('wins = wins + ?');
      values.push(stats.wins);
    }
    if (stats.losses !== undefined) {
      fields.push('losses = losses + ?');
      values.push(stats.losses);
    }
    if (stats.gamesPlayed !== undefined) {
      fields.push('games_played = games_played + ?');
      values.push(stats.gamesPlayed);
    }
    if (stats.totalDamage !== undefined) {
      fields.push('total_damage = total_damage + ?');
      values.push(stats.totalDamage);
    }
    if (stats.totalKills !== undefined) {
      fields.push('total_kills = total_kills + ?');
      values.push(stats.totalKills);
    }

    if (fields.length > 0) {
      values.push(userId);
      await this.pool.query(
        `UPDATE player_stats SET ${fields.join(', ')} WHERE user_id = ?`,
        values
      );
    }
  }

  async close() {
    await this.pool.end();
  }
}

export const databaseService = new DatabaseService();
