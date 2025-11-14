import { Asignatura } from '../malla/dto/malla-api.interface';

function normalizarCodigo(codigo: string): string {
    return codigo.trim().toUpperCase();
}

function puedeTomarse(curso: Asignatura, tomados: Set<string>, allCourseCodes: Set<string>): boolean {
    if (tomados.has(curso.codigo)) return false;
    if (curso.estado?.toLowerCase() === 'aprobado') return false;

    
    if (!curso.prereq || curso.prereq.length === 0) return true;

    
    return curso.prereq.every(p => {
        const pr = normalizarCodigo(p);

        if (!allCourseCodes.has(pr)) {
            console.log(`Prerrequisito ${pr} no encontrado en la malla. Se asume como cumplido.`);
            return true;
        }
        return pr === '' || tomados.has(pr);
    });
}


function cursosDisponibles(malla: Asignatura[], tomados: Set<string>, allCourseCodes: Set<string>): Asignatura[] {
    return malla.filter(curso => puedeTomarse(curso, tomados, allCourseCodes));
}

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

        
        if (aAlta && !bAlta) return -1;
        if (!aAlta && bAlta) return 1;

        
        if (aBaja && !bBaja) return 1;
        if (!aBaja && bBaja) return -1;

        
        if (a.nivel !== b.nivel) return a.nivel - b.nivel;

        
        return a.codigo.localeCompare(b.codigo);
    });
}

export function simularProgreso(malla: Asignatura[]) {
    const simulacion: any[] = [];

    const pendientes = malla.filter(c => c.estado?.toLowerCase() !== 'aprobado');
    const totalCursos = malla.length;
    const allCourseCodes = new Set(
        malla.map(c => normalizarCodigo(c.codigo))
    );
    const tomados = new Set(
        malla
            .filter(c => c.estado?.toLowerCase() === 'aprobado' || c.estado?.toLowerCase() === 'inscrito')
            .map(c => normalizarCodigo(c.codigo))
    );


    console.log(`Simulación iniciada: ${totalCursos} cursos pendientes.`);
    for (const curso of pendientes) {
        console.log(`Curso pendiente: ${curso.codigo} - ${curso.asignatura}`);
    }
    let iteraciones = 0;
    while (tomados.size < totalCursos) {
        iteraciones++;
        if (iteraciones > totalCursos * 3) {
            console.warn('Detenido: dependencia circular o prerrequisitos imposibles.');
            break;
        }


        let disponibles = cursosDisponibles(pendientes, tomados, allCourseCodes);
        for (const curso of disponibles) {
            console.log(`Curso pendiente: ${curso.codigo} - ${curso.asignatura}`);
        }
        disponibles = ordenarPorPrioridad(disponibles);

        if (disponibles.length === 0) {
            console.warn('No hay cursos disponibles (quizá prerrequisitos no encontrados).');
            break;
        }

        const semestre: Asignatura[] = [];
        let creditos = 0;

        for (const curso of disponibles) {
            console.log(curso.asignatura);
            if (creditos + curso.creditos > 30) continue;
            semestre.push(curso);
            creditos += curso.creditos;
        }

        if (semestre.length === 0) {
            console.warn('No se pudo llenar el semestre.');
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

        console.log(`Semestre ${simulacion.length}: ${semestre.length} cursos, ${creditos} créditos.`);
    }

    console.log(`Simulación finalizada con ${simulacion.length} semestres.`);
    return simulacion;
}

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
