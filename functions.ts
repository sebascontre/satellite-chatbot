export function traducirFollowAge(texto: string): string {
  return texto
    .replace(/\byears?\b/g, (m) => (m === 'year' ? 'año' : 'años'))
    .replace(/\bmonths?\b/g, (m) => (m === 'month' ? 'mes' : 'meses'))
    .replace(/\bweeks?\b/g, (m) => (m === 'week' ? 'semana' : 'semanas'))
    .replace(/\bdays?\b/g, (m) => (m === 'day' ? 'día' : 'días'))
    .replace(/\bhours?\b/g, (m) => (m === 'hour' ? 'hora' : 'horas'))
    .replace(/\bminutes?\b/g, (m) => (m === 'minute' ? 'minuto' : 'minutos'))
    .replace(/\bseconds?\b/g, (m) => (m === 'second' ? 'segundo' : 'segundos'))
}
