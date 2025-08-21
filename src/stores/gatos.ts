import { ref, computed, nextTick } from 'vue'
import { defineStore } from 'pinia'
import type GatoDto from './dtos/gato.dto'
import type DeseadoDto from './dtos/deseados.dto'

export const usegatosStore = defineStore('gatos', () => {
    let gatos = ref<GatoDto[]>([])
    let gatosFiltrados = ref<GatoDto[]>([])
    let gatosDeseados = ref<DeseadoDto[]>([]);

    const filtros = ref({
        edadMin: 1,
        edadMax: 15,
        raza: ''
    })

    function cargarGatosDeseadosDesdeStorage() {
        const gatosDeseadosGuardados = JSON.parse(localStorage.getItem('gatosDeseados') || '[]');
        if (gatosDeseadosGuardados.length > 0) {
            gatosDeseados.value = gatosDeseadosGuardados;
        }
    }

    function guardarGatosDeseadosEnStorage() {
        localStorage.setItem('gatosDeseados', JSON.stringify(gatosDeseados.value));
    }

    async function fetchGato() {
        try {
            const response = await fetch("http://localhost:5167/api/Gato");

            if (!response.ok) throw new Error('Error en la solicitud');

            const data: GatoDto[] = await response.json();
            gatos.value = data;
            aplicarFiltros();
            console.log('Gatos obtenidos:', data);
        } catch (error) {
            console.error('Error al obtener los gatos:', error);
        }
    }

    function actualizarFiltros(nuevosFiltros) {
        filtros.value = { ...filtros.value, ...nuevosFiltros }
        aplicarFiltros()
    }

    function aplicarFiltros() {
        gatosFiltrados.value = gatos.value.filter(gato => {
            const edadEnRango = gato.edad >= filtros.value.edadMin && gato.edad <= filtros.value.edadMax
            const razaCoincide = filtros.value.raza === '' || gato.raza === filtros.value.raza
            return edadEnRango && razaCoincide
        })
    }

    async function obtenerGatosDeseados(id_Usuario: number) {
        if (!id_Usuario || id_Usuario === undefined) {
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:5167/api/Deseado/usuario/${id_Usuario}`);
    
            if (response.status === 404) {
                console.log("Este usuario todavía no tiene favoritos.");
                gatosDeseados.value = [];
                guardarGatosDeseadosEnStorage();
                return;
            }
    
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
    
            const json = await response.json();
            console.log("Respuesta de deseados:", json);
    
            const data = Array.isArray(json) ? json : json.datos || [];
    
            const gatosCompletos = await Promise.all(
                data.map(async (deseado: any) => {
                    const gatoResponse = await fetch(`http://localhost:5167/api/Gato/${deseado.id_Gato}`);
                    if (!gatoResponse.ok) throw new Error(`Error al obtener el gato con id ${deseado.id_Gato}`);
    
                    const gato = await gatoResponse.json();
                    return { ...gato, id_Deseado: deseado.id_Deseado };
                })
            );
    
            gatosDeseados.value = gatosCompletos;
            guardarGatosDeseadosEnStorage();
    
        } catch (error) {
            console.error('Error al obtener los gatos deseados:', error);
        }
    }
    

    async function agregarGatoADeseados(id_Usuario: number, id_Gato: number) {
        try {
            const response = await fetch('http://localhost:5167/api/Deseado', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_Usuario: id_Usuario,
                    id_Gato: id_Gato,
                    fecha_Deseado: new Date().toISOString()
                })
            });
    
            if (!response.ok) throw new Error('Error al agregar el gato a deseados');
    
            const nuevoDeseado = await response.json(); // este sí tiene contenido
            gatosDeseados.value.push({ ...nuevoDeseado });
    
            guardarGatosDeseadosEnStorage();
            console.log('Gato agregado a deseados:', nuevoDeseado);
    
            return nuevoDeseado;
    
        } catch (error) {
            console.error('Error en agregarGatoADeseados:', error);
            throw error;
        }
    }
    

    async function eliminarGatoDeDeseados(idDeseado: number) {
        try {
            const response = await fetch(`http://localhost:5167/api/Deseado/${idDeseado}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Error al eliminar el gato de deseados');

            gatosDeseados.value = gatosDeseados.value.filter(gato => gato.id_Deseado !== idDeseado);
            guardarGatosDeseadosEnStorage();
            console.log(`Gato con ID deseado ${idDeseado} eliminado de deseados.`);
        } catch (error) {
            console.error('Error en eliminarGatoDeDeseados:', error);
        }
    }

    async function createGato(nuevoGato: GatoDto) {
        try {
            const response = await fetch("http://localhost:5167/api/Gato", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre_Gato: nuevoGato.nombre_Gato,
                    raza: nuevoGato.raza,
                    edad: nuevoGato.edad,
                    sexo: nuevoGato.sexo,
                    esterilizado: nuevoGato.esterilizado,
                    descripcion_Gato: nuevoGato.descripcion_Gato,
                    imagen_Gato: nuevoGato.imagen_Gato,
                    id_Protectora: nuevoGato.id_Protectora,
                    visible: nuevoGato.visible
                })
            });

            if (!response.ok) throw new Error("Error al agregar el gato");

            const gatoCreado = await response.json();
            gatos.value.push(gatoCreado);
            aplicarFiltros();
            console.log("Gato agregado exitosamente:", gatoCreado);
        } catch (error) {
            console.error("Error al agregar el gato:", error);
        }
    }

    async function deleteGato(id_Gato: number) {
        try {
            const response = await fetch(`http://localhost:5167/api/Gato/${id_Gato}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error("Error al eliminar el gato");

            gatos.value = gatos.value.filter(g => g.id_Gato !== id_Gato);
            console.log(`Gato con ID ${id_Gato} eliminado correctamente.`);
        } catch (error) {
            console.error("Error al eliminar el gato:", error);
        }
    }

    async function updateGato(gato: GatoDto) {
        try {
            console.log("Enviando datos para actualizar:", gato);

            const response = await fetch(`http://localhost:5167/api/Gato/${gato.id_Gato}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(gato)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error en la API:", errorText);
                throw new Error("Error al actualizar el usuario");
            }

            gatos.value = gatos.value.map(g => (g.id_Gato === gato.id_Gato ? gato : g));
            aplicarFiltros();
            console.log("Gato actualizado correctamente:", gato);
        } catch (error) {
            console.error("Error al actualizar el gato:", error);
        }
    }

    async function fetchGatosPorProtectora(idProtectora: number) {
        try {
            const response = await fetch(`http://localhost:5167/api/Gato/protectora/${idProtectora}`);
            if (!response.ok) throw new Error("Error al obtener los gatos de la protectora");
    
            const data = await response.json();
            console.log("Gatos de la protectora obtenidos:", data);
            return data;
        } catch (error) {
            console.error("Error en fetchGatosPorProtectora:", error);
            return [];
        }
    }
    

    return {
        gatos,
        gatosFiltrados,
        filtros,
        gatosDeseados,
        createGato,
        deleteGato,
        updateGato,
        fetchGato,
        actualizarFiltros,
        aplicarFiltros,
        obtenerGatosDeseados,
        agregarGatoADeseados,
        eliminarGatoDeDeseados,
        cargarGatosDeseadosDesdeStorage,
        fetchGatosPorProtectora
    }
})
