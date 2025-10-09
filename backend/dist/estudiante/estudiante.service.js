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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstudianteService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const estudiante_adapter_1 = require("./adapters/estudiante.adapter");
let EstudianteService = class EstudianteService {
    httpService;
    constructor(httpService) {
        this.httpService = httpService;
    }
    async findEstudiantePorCredenciales(email, password) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get('login.php', {
                params: { email, password },
            }));
            const apiData = response.data;
            if (!apiData || !apiData.rut) {
                throw new common_1.NotFoundException(`Credenciales incorrectas o estudiante no encontrado.`);
            }
            return (0, estudiante_adapter_1.toEstudianteDomain)(apiData);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.error('Error al contactar la API externa:', error.message);
            throw new common_1.InternalServerErrorException('Error al obtener los datos del estudiante.');
        }
    }
};
exports.EstudianteService = EstudianteService;
exports.EstudianteService = EstudianteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], EstudianteService);
//# sourceMappingURL=estudiante.service.js.map