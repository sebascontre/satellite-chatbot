export const checkSatellite: Record<string, string> = {
  sebascontre: 'Recuerden visitar la web de Satellite https://satellite.moe',
  satellitemoe: '¡Hola! Somos Satellite. ¡Visita nuestra web en https://satellite.moe para más información! 🌟',
}

export function raidMessage(username: string): string {
  let defaultText: string = `${username}! Le damos la bienvenida a tu comunidad`
  let customTexts: Record<string, string> = {
    chromevt: 'Chrome! Bienvenidos todos los sparkcitos',
    eclipsenoctis: 'Eclipse! Bienvenidas todas las lunitas',
    itsyamivt: 'Yami! Bienvenidos todos los lumis',
    magicgladius: 'Magic! Bienvenidos todos los magorditos',
    sebascontre: 'Seba! Bienvenida toda la gente bonita',
    oshibocchi: 'Oshi! Bienvenidos todos los kumicitos',
  }

  return `¡Muchas gracias por la raid ${customTexts[username.toLowerCase()] || defaultText}, esperamos que disfruten su
  estadia. Por favor recuerden que aquí solo pasamos repeticiones, y todo su apoyo sirve a todo el grupo Satellite.`
}
