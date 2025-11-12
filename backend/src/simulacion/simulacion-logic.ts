import { Asignatura } from '../malla/dto/malla-api.interface';

/**
 * Limpia y normaliza los códigos de prerrequisitos.
 */
function normalizarCodigo(codigo: string): string {
    return codigo.trim().toUpperCase();
}

/**
 * Determina si un curso puede ser tomado según los prerrequisitos ya tomados.
 */
function puedeTomarse(curso: Asignatura, tomados: Set<string>): boolean {
    if (tomados.has(curso.codigo)) return false;
    if (curso.estado?.toLowerCase() === 'aprobado') return false;

    // Sin prerrequisitos o prerrequisitos vacíos = disponible
    if (!curso.prereq || curso.prereq.length === 0) return true;

    // Todos los prerrequisitos deben haberse tomado
    return curso.prereq.every(p => {
        const pr = normalizarCodigo(p);
        return pr === '' || tomados.has(pr);
    });
}

/**
 * Devuelve los cursos disponibles actualmente.
 */
function cursosDisponibles(malla: Asignatura[], tomados: Set<string>): Asignatura[] {
    return malla.filter(curso => puedeTomarse(curso, tomados));
}

/**
 * Priorización avanzada:
 * 1️⃣ Ramos base (Programación, Matemática, Física, etc.)
 * 2️⃣ Cursos de menor nivel
 * 3️⃣ Electivos al final
 */
function ordenarPorPrioridad(cursos: Asignatura[]): Asignatura[] {
    const prioridadAlta = /(programación|matemática|álgebra|física|química|taller|introducción)/i;
    const prioridadBaja = /(electiva|formación general|valórica|fg)/i;

    return cursos.sort((a, b) => {
        const aNombre = a.asignatura;
        const bNombre = b.asignatura;

        const aAlta = prioridadAlta.test(aNombre);
        const bAlta = prioridadAlta.test(bNombre);
        const aBaja = prioridadBaja.test(aNombre);
        const bBaja = prioridadBaja.test(bNombre);

        // Alta prioridad primero
        if (aAlta && !bAlta) return -1;
        if (!aAlta && bAlta) return 1;

        // Baja prioridad al final
        if (aBaja && !bBaja) return 1;
        if (!aBaja && bBaja) return -1;

        // Luego por nivel
        if (a.nivel !== b.nivel) return a.nivel - b.nivel;

        // Finalmente por código
        return a.codigo.localeCompare(b.codigo);
    });
}

/**
 * Simula semestre a semestre respetando prerrequisitos y máximo de créditos.
 */
export function simularProgreso(malla: Asignatura[]) {
    const simulacion: any[] = [];

    const pendientes = malla.filter(c => c.estado?.toLowerCase() !== 'aprobado');
    const totalCursos = pendientes.length;
    const tomados = new Set<string>();

    console.log(`🚀 Simulación iniciada: ${totalCursos} cursos pendientes.`);

    let iteraciones = 0;
    while (tomados.size < totalCursos) {
        iteraciones++;
        if (iteraciones > totalCursos * 3) {
            console.warn('⚠️ Detenido: dependencia circular o prerrequisitos imposibles.');
            break;
        }

        let disponibles = cursosDisponibles(pendientes, tomados);
        disponibles = ordenarPorPrioridad(disponibles);

        if (disponibles.length === 0) {
            console.warn('⚠️ No hay cursos disponibles (quizá prerrequisitos no encontrados).');
            break;
        }

        const semestre: Asignatura[] = [];
        let creditos = 0;

        for (const curso of disponibles) {
            if (creditos + curso.creditos > 30) continue;
            semestre.push(curso);
            creditos += curso.creditos;
        }

        if (semestre.length === 0) {
            console.warn('⚠️ No se pudo llenar el semestre.');
            break;
        }

        simulacion.push({
            numero: simulacion.length + 1,
            creditos,
            cursos: semestre.map(c => ({
                codigo: c.codigo,
                nombre: c.asignatura,
                nivel: c.nivel,
                creditos: c.creditos,
                prerequisitos: c.prereq,
            })),
        });

        semestre.forEach(c => tomados.add(normalizarCodigo(c.codigo)));

        console.log(`📘 Semestre ${simulacion.length}: ${semestre.length} cursos, ${creditos} créditos.`);
    }

    console.log(`✅ Simulación finalizada con ${simulacion.length} semestres.`);
    return simulacion;
}

/**
 * Detecta cuellos de botella.
 */
export function detectarCuellosDeBotella(malla: Asignatura[]) {
    const dependencias: Record<string, number> = {};

    for (const curso of malla) {
        for (const p of curso.prereq) {
            const pr = normalizarCodigo(p);
            dependencias[pr] = (dependencias[pr] || 0) + 1;
        }
    }

    return Object.entries(dependencias)
        .sort((a, b) => b[1] - a[1])
        .map(([codigo, bloquea]) => ({ codigo, bloquea }));
}
