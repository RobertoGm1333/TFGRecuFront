import { ref, computed, nextTick } from 'vue'
import { defineStore } from 'pinia'
import type GatoDto from './dtos/gato.dto'
import type DeseadoDto from './dtos/deseados.dto'

export const usegatosStore = defineStore('gatos', () => {
    const API_BASE = 'http://localhost:5167'

    function normalizeImageUrl(url?: string | null) {
        if (!url) return url as any
        if (/^https?:\/\//i.test(url)) return url
        if (url.startsWith('/uploads') || url.startsWith('uploads')) return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`
        return url
    }

    let gatos = ref<GatoDto[]>([])
    let gatosFiltrados = ref<GatoDto[]>([])
    let gatosDeseados = ref<DeseadoDto[]>([])

    const filtros = ref({
        edadMin: 1,
        edadMax: 15,
        raza: ''
    })

    function cargarGatosDeseadosDesdeStorage() {
        const gatosDeseadosGuardados = JSON.parse(localStorage.getItem('gatosDeseados') || '[]')
        if (gatosDeseadosGuardados.length > 0) {
            gatosDeseados.value = gatosDeseadosGuardados
        }
    }

    function guardarGatosDeseadosEnStorage() {
        localStorage.setItem('gatosDeseados', JSON.stringify(gatosDeseados.value))
    }

    async function fetchGato() {
        try {
            const response = await fetch(`${API_BASE}/api/Gato`)
            if (!response.ok) throw new Error('Error en la solicitud')
            const data: GatoDto[] = await response.json()
            gatos.value = data.map(g => ({ ...g, imagen_Gato: normalizeImageUrl(g.imagen_Gato) as any }))
            aplicarFiltros()
            console.log('Gatos obtenidos:', gatos.value)
        } catch (error) {
            console.error('Error al obtener los gatos:', error)
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
        if (!id_Usuario || id_Usuario === undefined) return
        try {
            const response = await fetch(`${API_BASE}/api/Deseado/usuario/${id_Usuario}`)
            if (response.status === 404) {
                console.log('Este usuario todavía no tiene favoritos.')
                gatosDeseados.value = []
                guardarGatosDeseadosEnStorage()
                return
            }
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
            const json = await response.json()
            const data = Array.isArray(json) ? json : json.datos || []
            const gatosCompletos = await Promise.all(
                data.map(async (deseado: any) => {
                    const gatoResponse = await fetch(`${API_BASE}/api/Gato/${deseado.id_Gato}`)
                    if (!gatoResponse.ok) throw new Error(`Error al obtener el gato con id ${deseado.id_Gato}`)
                    const gato = await gatoResponse.json()
                    return { ...gato, id_Deseado: deseado.id_Deseado }
                })
            )
            gatosDeseados.value = gatosCompletos.map((g: any) => ({ ...g, imagen_Gato: normalizeImageUrl(g.imagen_Gato) }))
            guardarGatosDeseadosEnStorage()
        } catch (error) {
            console.error('Error al obtener los gatos deseados:', error)
        }
    }

    async function agregarGatoADeseados(id_Usuario: number, id_Gato: number) {
        try {
            const response = await fetch(`${API_BASE}/api/Deseado`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_Usuario: id_Usuario,
                    id_Gato: id_Gato,
                    fecha_Deseado: new Date().toISOString()
                })
            })
            if (!response.ok) throw new Error('Error al agregar el gato a deseados')
            const nuevoDeseado = await response.json()
            gatosDeseados.value.push({ ...nuevoDeseado })
            guardarGatosDeseadosEnStorage()
            console.log('Gato agregado a deseados:', nuevoDeseado)
            return nuevoDeseado
        } catch (error) {
            console.error('Error en agregarGatoADeseados:', error)
            throw error
        }
    }

    async function eliminarGatoDeDeseados(idDeseado: number) {
        try {
            const response = await fetch(`${API_BASE}/api/Deseado/${idDeseado}`, {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('Error al eliminar el gato de deseados')
            gatosDeseados.value = gatosDeseados.value.filter(gato => gato.id_Deseado !== idDeseado)
            guardarGatosDeseadosEnStorage()
            console.log(`Gato con ID deseado ${idDeseado} eliminado de deseados.`)
        } catch (error) {
            console.error('Error en eliminarGatoDeDeseados:', error)
        }
    }

    async function createGato(nuevoGato: GatoDto, archivo?: File | null) {
        try {
            const fd = new FormData()
            fd.append('Nombre_Gato', String(nuevoGato.nombre_Gato ?? ''))
            fd.append('Raza', String(nuevoGato.raza ?? ''))
            fd.append('Edad', String(nuevoGato.edad ?? 0))
            fd.append('Sexo', String(nuevoGato.sexo ?? ''))
            fd.append('Esterilizado', String(!!nuevoGato.esterilizado))
            fd.append('Descripcion_Gato', String(nuevoGato.descripcion_Gato ?? ''))
            fd.append('Id_Protectora', String(nuevoGato.id_Protectora ?? 0))
            fd.append('Visible', String(!!nuevoGato.visible))
            if (archivo) fd.append('Imagen', archivo)

            const response = await fetch(`${API_BASE}/api/Gato`, {
                method: 'POST',
                body: fd
            })
            if (!response.ok) {
                const errText = await response.text()
                throw new Error(`Error al agregar el gato: ${response.status} - ${errText}`)
            }
            const gatoCreado: GatoDto = await response.json()
            gatoCreado.imagen_Gato = normalizeImageUrl(gatoCreado.imagen_Gato) as any
            gatos.value.push(gatoCreado)
            aplicarFiltros()
            console.log('Gato agregado exitosamente:', gatoCreado)
        } catch (error) {
            console.error('Error al agregar el gato:', error)
            throw error
        }
    }

    async function deleteGato(id_Gato: number) {
        try {
            const response = await fetch(`${API_BASE}/api/Gato/${id_Gato}`, {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('Error al eliminar el gato')
            gatos.value = gatos.value.filter(g => g.id_Gato !== id_Gato)
            console.log(`Gato con ID ${id_Gato} eliminado correctamente.`)
        } catch (error) {
            console.error('Error al eliminar el gato:', error)
        }
    }

    async function updateGato(gato: GatoDto) {
        try {
            console.log('Enviando datos para actualizar:', gato)
            const response = await fetch(`${API_BASE}/api/Gato/${gato.id_Gato}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gato)
            })
            if (!response.ok) {
                const errorText = await response.text()
                console.error('Error en la API:', errorText)
                throw new Error('Error al actualizar el usuario')
            }
            const actualizado = { ...gato, imagen_Gato: normalizeImageUrl(gato.imagen_Gato) as any }
            gatos.value = gatos.value.map(g => (g.id_Gato === actualizado.id_Gato ? actualizado : g))
            aplicarFiltros()
            console.log('Gato actualizado correctamente:', actualizado)
        } catch (error) {
            console.error('Error al actualizar el gato:', error)
        }
    }

    async function fetchGatosPorProtectora(idProtectora: number) {
        try {
            const response = await fetch(`${API_BASE}/api/Gato/protectora/${idProtectora}`)
            if (!response.ok) throw new Error('Error al obtener los gatos de la protectora')
            const data = await response.json()
            return data.map((g: any) => ({ ...g, imagen_Gato: normalizeImageUrl(g.imagen_Gato) }))
        } catch (error) {
            console.error('Error en fetchGatosPorProtectora:', error)
            return []
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
