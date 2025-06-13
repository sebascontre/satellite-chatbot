import { serve } from 'bun'
import tmi from 'tmi.js'
import axios from 'axios'

import { checkSatellite, raidMessage } from './messages'
import { traducirFollowAge } from './utils'

const TWITCH_ID = new Map([
  ['chromevt', 155702183],
  ['eclipsenoctis', 916473359],
  ['itsyamivt', 641499175],
  ['magicgladius', 131183360],
  ['sebascontre', 36026178],
  ['satellitemoe', 1198464206],
])

const client = new tmi.client({
  options: { debug: true },
  identity: { username: 'satellitemoe', password: process.env.TWITCH_OAUTH || '' },
  channels: ['satellitemoe', 'sebascontre'],
})

client.on('message', (channel, tags, message, self) => {
  if (self) return // Ignora los mensaje que envia el propio bot
  message = message.toLowerCase() // Convierte el mensaje a minúsculas para evitar problemas de coincidencia
  channel = channel.slice(1).toLowerCase() // Quita el prefijo '#' al nombre del canal para compararlo con las claves del mapa

  if (channel === 'satellitemoe') {
    if (message === '!hola') {
      client.say(channel, `Hola, ${tags['display-name']}!`)
    }

    if (message === '!followage') {
      axios
        .get(`https://decapi.me/twitch/followage/satellitemoe/${tags.username}?token=${process.env.DECAPI_TOKEN}`)
        .then(function (response) {
          client.say(
            channel,
            `Increible, ${tags['display-name']} nos lleva siguiendo ${traducirFollowAge(response.data)}`,
          )
        })
    }
  } else {
    if (message.includes('!satellite')) {
      client.say(channel, checkSatellite[channel] || '1 2 3 Satellite!!')
    }
  }
})

client.on('raided', (channel, username, viewers) => {
  if (channel !== '#satellitemoe') return // Solo responde a raids en el canal de Satellite
  client.say(
    channel,
    raidMessage[channel] ||
      `¡Muchas gracias por la raid ${username}! Le damos la bienvenida a tu comunidad, esperamos que disfruten su estadia aquí. Por favor recuerden que en este canal pasamos repeticiones, y todo su apoyo aquí nos sirve a todo el grupo Satellite.`,
  )
})

client.on('pong', (latency) => {
  console.log('PONG enviado! Latencia: ' + latency)
  axios.get(`${process.env.CHATBOT_URL}/ping`)
})

client.connect()

serve({
  port: Number(process.env.PORT) || 3000,
  routes: {
    '/': Response.json({ hello: 'world' }),
    '/ping': Response.json({ ping: 'pong' }),
    '/shout': Response.json({ shout: 'not_done' }),
  },
  fetch(req) {
    return new Response('Not Found', { status: 404 })
  },
})
