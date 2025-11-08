import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../estudiante/dto/login.dto';
import { EstudianteService } from '../estudiante/estudiante.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly estudianteService: EstudianteService | any,
    private readonly jwtService: JwtService,
  ) {}

  private async findUserByIdentifier(identifier: string): Promise<any> {
    const isEmail = identifier.includes('@');
    let user: any = null;

    if (isEmail) {
      if (typeof this.estudianteService.findByEmail === 'function') {
        user = await this.estudianteService.findByEmail(identifier);
      } else if (typeof this.estudianteService.findOne === 'function') {
        user = await this.estudianteService.findOne({ email: identifier });
      }
    } else {
      if (typeof this.estudianteService.findByRut === 'function') {
        user = await this.estudianteService.findByRut(identifier);
      } else if (typeof this.estudianteService.findOne === 'function') {
        user = await this.estudianteService.findOne({ rut: identifier });
      }
    }

    return user;
  }

  async validateUser(identifier: string, pass: string): Promise<any | null> {
    const user: any = await this.findUserByIdentifier(identifier);
    if (!user) return null;

    const passwordHash: string | undefined =
      user.password || user.contrasena || user.hashedPassword;
    if (!passwordHash) return null;

    const match = await bcrypt.compare(pass, passwordHash);
    if (!match) return null;

    return {
      sub: user.id ?? user._id ?? user.rut,
      rut: user.rut,
      email: user.email,
      tipo: user.tipo,
      carreras: user.carreras,
    };
  }

  async login(dto: LoginDto) {
    const payload = await this.validateUser(dto.identifier, dto.password);
    if (!payload) throw new UnauthorizedException('Credenciales inválidas');
    const token = this.jwtService.sign(payload);
    return { access_token: token, expires_in: process.env.JWT_EXPIRES || '2h' };
  }
}
