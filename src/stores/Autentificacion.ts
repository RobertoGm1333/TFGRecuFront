import { defineStore } from 'pinia';

export const useAutenticacion = defineStore('Autenticacion', {
    state: () => ({
        usuario: null as {
            id_Usuario: number,
            nombre: string,
            apellido: string,
            email: string,
            rol: string,
            activo: boolean
        } | null
    }),

    getters: {
        esAutenticado: (state) => !!state.usuario && state.usuario.activo,
        esAdmin: (state) => state.usuario?.rol === 'admin' && state.usuario?.activo,
        esProtectora: (state) => state.usuario?.rol === 'protectora' && state.usuario?.activo,
        obtenerIdUsuario: (state) => state.usuario?.id_Usuario ?? null
    },

    actions: {
        iniciarSesion(datosUsuario: any) {
            if (!datosUsuario.activo) {
                this.cerrarSesion();
                throw new Error('Tu cuenta ha sido desactivada. Por favor, contacta con el administrador.');
            }
            console.log("Usuario recibido al iniciar sesión:", datosUsuario);
            this.usuario = datosUsuario;
            localStorage.setItem('user', JSON.stringify(datosUsuario));
        },

        cerrarSesion() {
            this.usuario = null;
            localStorage.removeItem('user');
        },

        cargarUsuarioDesdeLocalStorage() {
            const usuarioGuardado = localStorage.getItem('user');
            if (usuarioGuardado) {
                const usuario = JSON.parse(usuarioGuardado);
                if (!usuario.activo) {
                    this.cerrarSesion();
                    throw new Error('Tu cuenta ha sido desactivada. Por favor, contacta con el administrador.');
                }
                this.usuario = usuario;
            }
        }
    }
});