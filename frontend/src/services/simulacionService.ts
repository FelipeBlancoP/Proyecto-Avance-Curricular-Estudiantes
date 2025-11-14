export async function obtenerSimulacion(rut: string, codigoCarrera: string, catalogo: string, token: string) {
    const response = await fetch(
        `http://localhost:3000/simulacion/mi-simulacion?rut=${rut}&codigoCarrera=${codigoCarrera}&catalogo=${catalogo}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error('Error al obtener simulación');
    }

    return response.json();
}
