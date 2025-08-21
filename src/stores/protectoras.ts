import { defineStore } from 'pinia'
import { ref } from 'vue'
import type ProtectoraDto from './dtos/protectoras.dto'

export const useprotectorasStore = defineStore('protectoras', () => {
    const protectoras = ref<ProtectoraDto[]>([])
    const currentProtectora = ref<ProtectoraDto | null>(null)

    const fetchProtectora = async () => {
        try {
            const response = await fetch("http://localhost:5167/api/Protectora")
            if (!response.ok) throw new Error('Error al obtener las protectoras')
            protectoras.value = await response.json()
        } catch (error) {
            console.error('Error al obtener las protectoras:', error)
            throw error
        }
    }

    const fetchProtectoraById = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:5167/api/Protectora/${id}`)
            if (!response.ok) throw new Error('Error al obtener la protectora')
            currentProtectora.value = await response.json()
        } catch (error) {
            console.error('Error al obtener la protectora:', error)
            throw error
        }
    }

    const createProtectora = async (nuevaProtectora: Omit<ProtectoraDto, 'id_Protectora'>) => {
        try {
            const response = await fetch('http://localhost:5167/api/Protectora', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevaProtectora)
            })
            if (!response.ok) throw new Error('Error al crear la protectora')
            const protectoraCreada = await response.json()
            protectoras.value.push(protectoraCreada)
            return protectoraCreada
        } catch (error) {
            console.error('Error al crear la protectora:', error)
            throw error
        }
    }

    const updateProtectora = async (id: number, protectora: Partial<ProtectoraDto>) => {
        try {
            const response = await fetch(`http://localhost:5167/api/Protectora/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(protectora)
            })
            if (!response.ok) throw new Error('Error al actualizar la protectora')
            const protectoraActualizada = await response.json()
            const index = protectoras.value.findIndex(p => p.id_Protectora === id)
            if (index !== -1) {
                protectoras.value[index] = protectoraActualizada
            }
            return protectoraActualizada
        } catch (error) {
            console.error('Error al actualizar la protectora:', error)
            throw error
        }
    }

    const deleteProtectora = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:5167/api/Protectora/${id}`, {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('Error al eliminar la protectora')
            protectoras.value = protectoras.value.filter(p => p.id_Protectora !== id)
        } catch (error) {
            console.error('Error al eliminar la protectora:', error)
            throw error
        }
    }

    return {
        protectoras,
        currentProtectora,
        fetchProtectora,
        fetchProtectoraById,
        createProtectora,
        updateProtectora,
        deleteProtectora
    }
})
