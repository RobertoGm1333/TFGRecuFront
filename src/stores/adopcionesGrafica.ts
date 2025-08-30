import { defineStore } from 'pinia'
import type { PuntoGraficaAdopciones, RespuestaGraficaAdopciones } from './dtos/adopcionesgrafica.dto'

// Usa la misma convención que el resto de stores de tu carpeta.
// Base URL configurable (igual que en otros stores, si lo usas):
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5167'

export const useAdopcionesGraficaStore = defineStore('adopcionesGrafica', {
  state: () => ({
    serie: [] as PuntoGraficaAdopciones[],
    cargando: false as boolean,
    error: null as string | null
  }),

  getters: {
    // Devuelve toda la serie (por si en el futuro agregas varias)
    getSerie: (state) => state.serie,

    // Filtra por protectora (útil si en el futuro traes serie global)
    getSeriePorProtectora: (state) => (protectoraId: number | null | undefined) => {
      if (protectoraId == null) return state.serie
      return state.serie.filter(p => p.id_Protectora === protectoraId)
    }
  },

  actions: {
    reset() {
      this.serie = []
      this.cargando = false
      this.error = null
    },

    /**
     * Carga la serie desde /api/Adopcion/grafica/por-protectora
     * Si pasas protectoraId, se filtra en cliente para garantizar
     * que la vista de protectora solo vea su propia serie.
     */
    async fetchSeriePorProtectora(protectoraId?: number | null) {
      try {
        this.cargando = true
        this.error = null

        const res = await fetch(`${API_BASE}/api/Adopcion/grafica/por-protectora`, {
          headers: { Accept: 'application/json' }
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data = (await res.json()) as unknown

        const lista = Array.isArray(data) ? (data as RespuestaGraficaAdopciones) : []

        // Filtro opcional en cliente por seguridad de la vista de protectora
        this.serie = protectoraId != null
          ? lista.filter(x => x.id_Protectora === protectoraId)
          : lista
      } catch (e: any) {
        this.error = e?.message ?? 'Error cargando la serie de adopciones'
        this.serie = []
      } finally {
        this.cargando = false
      }
    },

    /**
     * Alternativa por si en el panel de admin global quieres traer la misma serie
     * sin filtrar por protectora.
     */
    async fetchSerieGlobal() {
      return this.fetchSeriePorProtectora(null)
    }
  }
})
