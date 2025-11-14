import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
  private blacklistedTokens: Set<string> = new Set();
  addToBlacklist(token: string): void {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const expiresAt = payload.exp * 1000;
      this.blacklistedTokens.add(token);
      const ttl = expiresAt - Date.now();
      if (ttl > 0) {
        setTimeout(() => {
          this.blacklistedTokens.delete(token);
        }, ttl);
      }
    } catch (error) {
      this.blacklistedTokens.add(token);
    }
  }
  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }
  getBlacklistSize(): number {
    return this.blacklistedTokens.size;
  }
  clearExpiredTokens(): void {
    const now = Math.floor(Date.now() / 1000); 
    for (const token of this.blacklistedTokens) {
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload.exp < now) {
          this.blacklistedTokens.delete(token);
        }
      } catch (error) {
        this.blacklistedTokens.delete(token);
      }
    }
  }
}