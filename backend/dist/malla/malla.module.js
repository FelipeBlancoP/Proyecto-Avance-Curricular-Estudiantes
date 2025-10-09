"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MallaModule = void 0;
const common_1 = require("@nestjs/common");
const malla_service_1 = require("./malla.service");
const malla_controller_1 = require("./malla.controller");
const config_1 = require("@nestjs/config");
let MallaModule = class MallaModule {
};
exports.MallaModule = MallaModule;
exports.MallaModule = MallaModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [malla_service_1.MallaService],
        controllers: [malla_controller_1.MallaController]
    })
], MallaModule);
//# sourceMappingURL=malla.module.js.map