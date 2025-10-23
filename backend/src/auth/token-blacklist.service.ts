import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
  private blacklistedTokens: Set<string> = new Set();

  /**
   * Agrega un token a la blacklist y programa su limpieza automática
   */
  addToBlacklist(token: string): void {
    try {
      // Extraer el payload del token para obtener la expiración
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const expiresAt = payload.exp * 1000; // Convertir a milisegundos
      
      // Agregar a la blacklist
      this.blacklistedTokens.add(token);
      
      // Programar eliminación automática después de la expiración
      const ttl = expiresAt - Date.now();
      if (ttl > 0) {
        setTimeout(() => {
          this.blacklistedTokens.delete(token);
        }, ttl);
      }
    } catch (error) {
      // Si hay error al decodificar el token, igual lo agregamos por seguridad
      this.blacklistedTokens.add(token);
    }
  }

  /**
   * Verifica si un token está en la blacklist
   */
  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Obtiene el número de tokens en la blacklist (útil para debugging)
   */
  getBlacklistSize(): number {
    return this.blacklistedTokens.size;
  }

  /**
   * Limpia manualmente la blacklist (opcional)
   */
  clearExpiredTokens(): void {
    const now = Math.floor(Date.now() / 1000); // Timestamp en segundos
    for (const token of this.blacklistedTokens) {
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload.exp < now) {
          this.blacklistedTokens.delete(token);
        }
      } catch (error) {
        // Si no se puede decodificar, eliminar el token
        this.blacklistedTokens.delete(token);
      }
    }
  }
}