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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MallaController = void 0;
const common_1 = require("@nestjs/common");
const malla_service_1 = require("./malla.service");
let MallaController = class MallaController {
    mallaService;
    constructor(mallaService) {
        this.mallaService = mallaService;
    }
    async obtenerMalla(codigoCarrera) {
        return this.mallaService.obtenerMalla(codigoCarrera);
    }
};
exports.MallaController = MallaController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('codigoCarrera')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MallaController.prototype, "obtenerMalla", null);
exports.MallaController = MallaController = __decorate([
    (0, common_1.Controller)('malla'),
    __metadata("design:paramtypes", [malla_service_1.MallaService])
], MallaController);
//# sourceMappingURL=malla.controller.js.map