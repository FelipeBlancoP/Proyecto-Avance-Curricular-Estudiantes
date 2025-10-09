"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MallaService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@nestjs/config");
let MallaService = class MallaService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async obtenerMalla(codigoCarrera) {
        try {
            const url = `https://losvilos.ucn.cl/hawaii/api/mallas?${codigoCarrera}`;
            const { data } = await axios_1.default.get(url, {
                headers: {
                    'X-HAWAII-AUTH': this.configService.get('HAWAII_AUTH'),
                },
            });
            return data;
        }
        catch (error) {
            console.error('Error al obtener malla:', error.message);
            throw new common_1.HttpException(`Error al obtener malla curricular: ${error.message}`, common_1.HttpStatus.BAD_GATEWAY);
        }
    }
};
exports.MallaService = MallaService;
exports.MallaService = MallaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MallaService);
//# sourceMappingURL=malla.service.js.map