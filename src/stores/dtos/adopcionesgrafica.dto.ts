export interface PuntoGraficaAdopciones {
  mesYYYYMM: string
  id_Protectora: number
  nombre_Protectora: string
  total: number
}

// Si en algún momento necesitas envolver la respuesta:
export type RespuestaGraficaAdopciones = PuntoGraficaAdopciones[]
