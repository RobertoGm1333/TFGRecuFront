import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type UserDto from './dtos/user.dto'

export function esContraseñaValida(password: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{7,}$/;
    return regex.test(password);
  }
  