import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type UserDto from './dtos/user.dto'

export const useusuariosStore = defineStore('usuarios', () => {
    const usuarios = ref(new Array<UserDto>())


    /* function findAll() {
         //fetch('https://jsonplaceholder.typicode.com/user')
         //resizeBy.json()
         //data
         let data = [
             { Id_Usuario: 0, Nombre_Usuario: 'test', Apellido: 'test', Contraseña: 'test', Email_Usuario: 'test', Fecha_Registro: new Date(), Rol: 'admin', Activo: true },
             { Id_Usuario: 1, Nombre_Usuario: 'test', Apellido: 'test', Contraseña: 'test', Email_Usuario: 'test', Fecha_Registro: new Date(), Rol: 'protectora', Activo: false },
     
         ]
         usuarios.value.splice(0, usuarios.value.length, ...data)
     }*/

    function createUsuario(usuario: UserDto) {
        //fetch(POST)
        //body: JSON.stringify()

        usuarios.value.push(usuario)
    }


    async function fetchUsuarios() {
        try {
            const response = await fetch("http://localhost:5167/api/Usuario");
            if (!response.ok) throw new Error("Error al obtener los usuarios");

            usuarios.value = await response.json();
            console.log("Usuarios obtenidos:", usuarios.value);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    }

    async function updateUsuario(usuario: UserDto) {
        try {
            console.log("Enviando datos para actualizar:", usuario);

            const response = await fetch(`http://localhost:5167/api/Usuario/${usuario.id_Usuario}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(usuario),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error en la API:", errorText);
                throw new Error("Error al actualizar el usuario");
            }

            usuarios.value = usuarios.value.map(u => (u.id_Usuario === usuario.id_Usuario ? usuario : u));
            console.log("Usuario actualizado:", usuario);
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
        }
    }

    async function deleteUsuario(id_Usuario: number) {
        if (!id_Usuario) return;

        try {
            console.log("Eliminando usuario con ID:", id_Usuario);

            const response = await fetch(`http://localhost:5167/api/Usuario/${id_Usuario}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Error al eliminar el usuario");

            usuarios.value = usuarios.value.filter(u => u.id_Usuario !== id_Usuario);
            console.log(`Usuario con ID ${id_Usuario} eliminado.`);
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
        }
    }

    function getUsuarioByEmail(email: string) {
        return usuarios.value.find(u => u.email === email) || null;
    }

    function getUsuarioByEmailYContraseña(email: string, contraseña: string) {
        const usuario = usuarios.value.find(u => u.email === email && u.contraseña === contraseña);
        if (!usuario) return null;

        // Mapeo Rol → rol (minúscula) para que funcione con el store de autenticacion
        return {
            ...usuario,
            rol: (usuario as any).rol ?? (usuario as any).Rol
        }
    }


    // REST
    // create, delete, updated....

    return {
        usuarios,
        createUsuario,
        deleteUsuario,
        updateUsuario,
        fetchUsuarios,
        getUsuarioByEmail,
        getUsuarioByEmailYContraseña
    }
})
