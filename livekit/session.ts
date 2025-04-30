// src/livekit/session.ts
import { LogLevel, SessionLogEntry } from './types';
import colors from 'colors/safe';

/**
 * Session logger interface to define various log storage implementations
 */
export interface LogStorage {
  saveLog(entry: SessionLogEntry): Promise<void>;
  getLogsByRoom(roomId: string, options?: { limit?: number; offset?: number }): Promise<SessionLogEntry[]>;
}

/**
 * In-memory implementation of log storage (for development/testing)
 */
export class InMemoryLogStorage implements LogStorage {
  private logs: SessionLogEntry[] = [];
  
  async saveLog(entry: SessionLogEntry): Promise<void> {
    this.logs.push(entry);
    
    // Keep memory usage reasonable by limiting array size
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(this.logs.length - 10000);
    }
  }
  
  async getLogsByRoom(roomId: string, options: { limit?: number; offset?: number } = {}): Promise<SessionLogEntry[]> {
    const roomLogs = this.logs.filter(log => log.roomId === roomId);
    
    const offset = options.offset || 0;
    const limit = options.limit || roomLogs.length;
    
    return roomLogs.slice(offset, offset + limit);
  }
}

/**
 * Database implementation of log storage
 * This is a placeholder that would integrate with your database of choice
 */
export class DatabaseLogStorage implements LogStorage {
  private dbClient: any; // Replace with your actual DB client type
  
  constructor(dbClient: any) {
    this.dbClient = dbClient;
  }
  
  async saveLog(entry: SessionLogEntry): Promise<void> {
    // Implementation would depend on your database
    // Example for a SQL-like database:
    /*
    await this.dbClient.query(
      'INSERT INTO session_logs (room_id, timestamp, level, event, user_id, metadata) VALUES (?, ?, ?, ?, ?, ?)',
      [entry.roomId, entry.timestamp, entry.level, entry.event, entry.userId || null, JSON.stringify(entry.metadata || {})]
    );
    */
    
    // This is just a placeholder
    console.log(colors.dim('[DatabaseLogStorage] Would save log to database'), entry);
  }
  
  async getLogsByRoom(roomId: string, options: { limit?: number; offset?: number } = {}): Promise<SessionLogEntry[]> {
    // Implementation would depend on your database
    // Example for a SQL-like database:
    /*
    const limit = options.limit || 100;
    const offset = options.offset || 0;
    
    const result = await this.dbClient.query(
      'SELECT * FROM session_logs WHERE room_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      [roomId, limit, offset]
    );
    
    return result.rows.map(row => ({
      roomId: row.room_id,
      timestamp: row.timestamp,
      level: row.level as LogLevel,
      event: row.event,
      userId: row.user_id,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined
    }));
    */
    
    // This is just a placeholder
    console.log(colors.dim('[DatabaseLogStorage] Would query logs from database'), { roomId, options });
    return [];
  }
}

/**
 * Session logger for tracking and recording session activities
 */
export class SessionLogger {
  private storage: LogStorage;
  private consoleLogging: boolean;
  
  constructor(storage: LogStorage, consoleLogging: boolean = true) {
    this.storage = storage;
    this.consoleLogging = consoleLogging;
    
    console.log(colors.cyan('[SessionLogger]'), 'Initialized');
  }

  /**
   * Log a debug level entry
   */
  async debug(roomId: string, event: string, metadata?: Record<string, any>, userId?: string): Promise<void> {
    await this.log(LogLevel.DEBUG, roomId, event, metadata, userId);
  }

  /**
   * Log an info level entry
   */
  async info(roomId: string, event: string, metadata?: Record<string, any>, userId?: string): Promise<void> {
    await this.log(LogLevel.INFO, roomId, event, metadata, userId);
  }

  /**
   * Log a warning level entry
   */
  async warn(roomId: string, event: string, metadata?: Record<string, any>, userId?: string): Promise<void> {
    await this.log(LogLevel.WARN, roomId, event, metadata, userId);
  }

  /**
   * Log an error level entry
   */
  async error(roomId: string, event: string, metadata?: Record<string, any>, userId?: string): Promise<void> {
    await this.log(LogLevel.ERROR, roomId, event, metadata, userId);
  }

  /**
   * Log an entry with the specified level
   */
  private async log(level: LogLevel, roomId: string, event: string, metadata?: Record<string, any>, userId?: string): Promise<void> {
    const entry: SessionLogEntry = {
      roomId,
      timestamp: Date.now(),
      level,
      event,
      userId,
      metadata
    };
    
    // Save to storage
    await this.storage.saveLog(entry);
    
    // Also log to console if configured
    if (this.consoleLogging) {
      this.consoleLog(entry);
    }
  }

  /**
   * Output log entry to console with color formatting
   */
  private consoleLog(entry: SessionLogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const roomIdStr = colors.yellow(`[Room: ${entry.roomId}]`);
    const userIdStr = entry.userId ? colors.blue(`[User: ${entry.userId}]`) : '';
    
    let levelStr: string;
    switch (entry.level) {
      case LogLevel.DEBUG:
        levelStr = colors.dim('[DEBUG]');
        break;
      case LogLevel.INFO:
        levelStr = colors.green('[INFO]');
        break;
      case LogLevel.WARN:
        levelStr = colors.yellow('[WARN]');
        break;
      case LogLevel.ERROR:
        levelStr = colors.red('[ERROR]');
        break;
    }
    
    const metadataStr = entry.metadata ? colors.dim(` ${JSON.stringify(entry.metadata)}`) : '';
    
    console.log(`${colors.dim(timestamp)} ${levelStr} ${roomIdStr} ${userIdStr} ${entry.event}${metadataStr}`);
  }

  /**
   * Get logs for a specific room
   */
  async getLogsByRoom(roomId: string, options?: { limit?: number; offset?: number }): Promise<SessionLogEntry[]> {
    return this.storage.getLogsByRoom(roomId, options);
  }
}

/**
 * Factory for creating a SessionLogger with appropriate storage
 */
export class SessionLoggerFactory {
  /**
   * Create an in-memory logger (for development/testing)
   */
  static createInMemoryLogger(consoleLogging: boolean = true): SessionLogger {
    return new SessionLogger(new InMemoryLogStorage(), consoleLogging);
  }
  
  /**
   * Create a database-backed logger
   */
  static createDatabaseLogger(dbClient: any, consoleLogging: boolean = true): SessionLogger {
    return new SessionLogger(new DatabaseLogStorage(dbClient), consoleLogging);
  }
}