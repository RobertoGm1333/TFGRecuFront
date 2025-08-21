import { ref } from 'vue'
import { defineStore } from 'pinia'
import type SolicitudAdopcionDto from './dtos/solicitudadopcion.dto'

export const useSolicitudesAdopcionStore = defineStore('solicitudesAdopcion', () => {
    const solicitudes = ref<SolicitudAdopcionDto[]>([])

    // Obtener el token de autenticación y datos del usuario
    function getAuthData() {
        const user = localStorage.getItem('user')
        if (!user) return null
        const userData = JSON.parse(user)
        return {
            token: userData.token,
            id: userData.id_Usuario
        }
    }

    // Obtener TODAS las solicitudes (admin)
    async function fetchSolicitudes() {
        try {
            const authData = getAuthData()
            if (!authData) return
            
            const response = await fetch('http://localhost:5167/api/SolicitudAdopcion', {
                headers: {
                    'Authorization': `Bearer ${authData.token}`
                }
            })
            if (!response.ok) throw new Error('Error al obtener las solicitudes')
            solicitudes.value = await response.json()
        } catch (error) {
            console.error('Error en fetchSolicitudes:', error)
        }
    }

    // Obtener solicitudes del usuario loggeado
    async function fetchMisSolicitudes() {
        try {
            const authData = getAuthData()
            if (!authData) return
            
            const response = await fetch(`http://localhost:5167/api/SolicitudAdopcion/usuario/${authData.id}`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`
                }
            })
            if (!response.ok) throw new Error('Error al obtener mis solicitudes')
            solicitudes.value = await response.json()
        } catch (error) {
            console.error('Error en fetchMisSolicitudes:', error)
        }
    }

    // Obtener solicitudes de una protectora (por idProtectora)
    async function fetchSolicitudesProtectora(idProtectora: number) {
        try {
            const authData = getAuthData()
            if (!authData) return
            
            const response = await fetch(`http://localhost:5167/api/SolicitudAdopcion/protectora/${idProtectora}`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`
                }
            })
            if (!response.ok) throw new Error('Error al obtener solicitudes de protectora')
            solicitudes.value = await response.json()
        } catch (error) {
            console.error('Error en fetchSolicitudesProtectora:', error)
        }
    }

    // Crear solicitud (usuario)
    async function createSolicitud(solicitud: SolicitudAdopcionDto) {
        try {
            const authData = getAuthData()
            if (!authData) {
                throw new Error('No hay sesión de usuario activa')
            }

            console.log('Enviando solicitud con datos:', JSON.stringify(solicitud, null, 2))

            // Primero verificar si ya existe una solicitud
            try {
                const checkResponse = await fetch(`http://localhost:5167/api/SolicitudAdopcion/usuario/${solicitud.id_Usuario}/gato/${solicitud.id_Gato}`)
                
                if (checkResponse.ok) {
                    const existingSolicitud = await checkResponse.json()
                    console.log('Solicitud existente encontrada:', existingSolicitud)
                    throw new Error('Ya existe una solicitud de adopción para este gato')
                }
            } catch (checkError) {
                // Si no existe, continuar con la creación
                // No hacemos nada si el error es 404, significa que no existe la solicitud
                if (checkError instanceof Error && checkError.message !== 'Ya existe una solicitud de adopción para este gato') {
                    console.log('Error al verificar si existe la solicitud, pero continuamos:', checkError)
                }
            }

            // Validar campos requeridos antes de enviar
            const camposRequeridos = [
                'nombreCompleto',
                'edad',
                'direccion',
                'dni',
                'telefono',
                'email',
                'tipoVivienda',
                'propiedadAlquiler',
                'permiteAnimales',
                'numeroPersonas',
                'experienciaGatos',
                'tieneOtrosAnimales',
                'cortarUnas',
                'animalesVacunadosEsterilizados',
                'historialMascotas',
                'motivacionAdopcion',
                'problemasComportamiento',
                'enfermedadesCostosas',
                'vacaciones',
                'seguimientoPostAdopcion',
                'visitaHogar'
            ]

            const camposFaltantes = camposRequeridos.filter(campo => {
                const valor = solicitud[campo as keyof SolicitudAdopcionDto]
                return valor === undefined || valor === null || valor === ''
            })

            if (camposFaltantes.length > 0) {
                throw new Error(`Faltan campos requeridos: ${camposFaltantes.join(', ')}`)
            }
            
            // Asegurar que los campos no estén definidos como null
            Object.keys(solicitud).forEach(key => {
                const keyName = key as keyof SolicitudAdopcionDto
                if (solicitud[keyName] === null) {
                    // Mantener los valores nulos para edad y numeroPersonas
                    if (keyName === 'edad' || keyName === 'numeroPersonas') {
                        return;
                    }
                    // Convertir null a un valor por defecto según el tipo para otros campos
                    if (typeof Boolean(solicitud[keyName]) === 'boolean') {
                        solicitud[keyName] = false as any;
                    } else if (typeof Number(solicitud[keyName]) === 'number') {
                        solicitud[keyName] = 0 as any;
                    } else {
                        solicitud[keyName] = '' as any;
                    }
                }
            })

            console.log('Enviando solicitud a la API:', JSON.stringify(solicitud))
            
            const response = await fetch('http://localhost:5167/api/SolicitudAdopcion', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.token}`
                },
                body: JSON.stringify(solicitud)
            })

            console.log('Respuesta del servidor:', response.status, response.statusText)

            if (!response.ok) {
                let errorMessage = 'Error al crear la solicitud'
                try {
                    const errorData = await response.json()
                    console.error('Datos de error:', errorData)
                    errorMessage = errorData.message || errorData.title || errorMessage
                    if (errorData.errors) {
                        errorMessage += ': ' + Object.values(errorData.errors).flat().join(', ')
                    }
                } catch (e) {
                    console.error('No se pudieron parsear los datos de error:', e)
                }
                throw new Error(errorMessage)
            }

            const nueva = await response.json()
            solicitudes.value.push(nueva)
            return nueva
        } catch (error) {
            console.error('Error en createSolicitud:', error)
            throw error // Propagar el error para manejarlo en el componente
        }
    }

    // Actualizar solicitud completa (solo para admin o caso especial)
    async function updateSolicitud(solicitud: SolicitudAdopcionDto) {
        try {
            const authData = getAuthData()
            if (!authData) return
            
            const response = await fetch(`http://localhost:5167/api/SolicitudAdopcion/${solicitud.id_Solicitud}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.token}`
                },
                body: JSON.stringify(solicitud)
            })

            if (!response.ok) throw new Error('Error al actualizar la solicitud')

            solicitudes.value = solicitudes.value.map(s =>
                s.id_Solicitud === solicitud.id_Solicitud ? solicitud : s
            )
        } catch (error) {
            console.error('Error en updateSolicitud:', error)
        }
    }

    // Cambiar solo estado y comentario de protectora (para protectora)
    async function updateEstadoSolicitud(idSolicitud: number, estado: string, comentarioProtectora: string, idProtectora: number) {
        try {
            const authData = getAuthData()
            if (!authData) return
            
            // Normalizar el estado para la API
            const estadoNormalizado = estado.charAt(0).toUpperCase() + estado.slice(1)
            
            const response = await fetch(`http://localhost:5167/api/SolicitudAdopcion/estado/${idSolicitud}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.token}`
                },
                body: JSON.stringify({ estado: estadoNormalizado, comentario_Protectora: comentarioProtectora })
            })
            if (!response.ok) throw new Error('Error al actualizar el estado')

            await fetchSolicitudesProtectora(idProtectora)
        } catch (error) {
            console.error('Error en updateEstadoSolicitud:', error)
            throw error
        }
    }    

    // Eliminar solicitud
    async function deleteSolicitud(id_Solicitud: number) {
        try {
            const authData = getAuthData()
            if (!authData) return
            
            const response = await fetch(`http://localhost:5167/api/SolicitudAdopcion/${id_Solicitud}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authData.token}`
                }
            })

            if (!response.ok) throw new Error('Error al eliminar la solicitud')

            solicitudes.value = solicitudes.value.filter(s => s.id_Solicitud !== id_Solicitud)
        } catch (error) {
            console.error('Error en deleteSolicitud:', error)
        }
    }

    async function fetchSolicitudById(id_Solicitud: number) {
        try {
            const authData = getAuthData()
            if (!authData) return null
            
            const response = await fetch(`http://localhost:5167/api/SolicitudAdopcion/${id_Solicitud}`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`
                }
            })
            if (!response.ok) throw new Error('Error al obtener la solicitud')
            return await response.json()
        } catch (error) {
            console.error('Error en fetchSolicitudById:', error)
            return null
        }
    }

    return {
        solicitudes,
        fetchSolicitudes,
        fetchMisSolicitudes,
        fetchSolicitudesProtectora,
        createSolicitud,
        updateSolicitud,
        updateEstadoSolicitud,
        deleteSolicitud,
        fetchSolicitudById
    }
})
