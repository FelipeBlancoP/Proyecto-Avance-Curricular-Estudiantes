"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toEstudianteDomain = toEstudianteDomain;
function toEstudianteDomain(apiData) {
    return {
        rut: apiData.rut,
        carreras: apiData.carreras.map(carreraApi => ({
            codigo: carreraApi.codigo,
            nombre: carreraApi.nombre,
            catalogo: carreraApi.catalogo,
        })),
    };
}
//# sourceMappingURL=estudiante.adapter.js.map