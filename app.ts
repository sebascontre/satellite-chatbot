import Fastify from 'fastify'
import tmi from 'tmi.js'
import axios from 'axios'
import qs from 'fast-querystring'

const fastify = Fastify()
const port = Number(process.env.PORT) || 3001

const twitch_headers = {
  headers: {
    'Client-ID': process.env.TWITCH_CLIENT_ID,
    Authorization: `Bearer ${process.env.TWITCH_OAUTH}`,
  },
}

const twitch_id = new Map([
  ['chromevt', 155702183],
  ['eclipsenoctis', 916473359],
  ['itsyamivt', 641499175],
  ['magicgladius', 131183360],
  ['sebascontre', 36026178],
  ['satellitemoe', 1198464206],
])

// Configuración básica de tmi.js
const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: 'satellitemoe',
    password: process.env.TWITCH_OAUTH,
  },
  channels: ['satellitemoe'],
})

// Conectar el cliente
client.connect()

// Manejar mensajes en el chat
client.on('message', (channel, tags, message, self) => {
  if (self) return // Ignorar mensajes del bot

  console.log(channel)

  // Responder a un comando
  if (message.toLowerCase() === '!hola') {
    client.say(channel, `Hola, ${tags.username}!`)
  }

  if (message.toLowerCase() === '!followage') {
    axios.get(`https://decapi.me/twitch/followage/satellitemoe/${tags.username}?token=${process.env.DECAPI_TOKEN}`).then(function (response) {
      client.say(channel, response.data)
    })
  }
})

client.on('raided', (channel, username, viewers) => {
  let message = ''

  if (channel.toLowerCase() === '#satellitemoe') {
    switch (username.toLowerCase()) {
      case 'chromevt':
        message = `¡Muchas gracias por la raid Chrome! Bienvenidos todos los sparkcitos, esperamos que disfruten su estadia aquí. Por favor recuerden que en este canal pasamos repeticiones, y todo su apoyo aquí nos sirve a todo el grupo Satellite.`
        break
      case 'eclipsenoctis':
        message = `¡Muchas gracias por la raid Eclipse! Bienvenidas todas las lunitas, esperamos que disfruten su estadia aquí. Por favor recuerden que en este canal pasamos repeticiones, y todo su apoyo aquí nos sirve a todo el grupo Satellite.`
        break
      case 'itsyamivt':
        message = `¡Muchas gracias por la raid Yami! Bienvenidos todos los lumis, esperamos que disfruten su estadia aquí. Por favor recuerden que en este canal pasamos repeticiones, y todo su apoyo aquí nos sirve a todo el grupo Satellite.`
        break
      case 'magicgladius':
        message = `¡Muchas gracias por la raid Magic! Bienvenidos todos los magorditos, esperamos que disfruten su estadia aquí. Por favor recuerden que en este canal pasamos repeticiones, y todo su apoyo aquí nos sirve a todo el grupo Satellite.`
        break
      case 'sebascontre':
        message = `¡Muchas gracias por la raid Seba! Bienvenida toda la gente bonita, esperamos que disfruten su estadia aquí. Por favor recuerden que en este canal pasamos repeticiones, y todo su apoyo aquí nos sirve a todo el grupo Satellite.`
        break
      case 'oshibocchi':
        message = `¡Muchas gracias por la raid Oshi! Bienvenida todos los kumicitos, esperamos que disfruten su estadia aquí. Por favor recuerden que en este canal pasamos repeticiones, y todo su apoyo aquí nos sirve a todo el grupo Satellite.`
        break
      default:
        message = `¡Muchas gracias por la raid ${username}! Le damos la bienvenida a tu comunidad, esperamos que disfruten su estadia aquí. Por favor recuerden que en este canal pasamos repeticiones, y todo su apoyo aquí nos sirve a todo el grupo Satellite.`
    }
  }

  if (message !== '') client.say(channel, message)
})

client.on('pong', (latency) => {
  console.log('PONG enviado! Latencia: ' + latency)
  axios.get(`${process.env.CHATBOT_URL}/ping`)
})

// Configurar una ruta en Fastify
fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

fastify.get('/shout', async (request, reply) => {
  axios
    .get(process.env.RUNNEL_STREAM, {
      headers: {
        Cookie: `API_KEY=${process.env.RUNNEL_COOKIE};`,
      },
    })
    .then(function (response) {
      let video = response.data[0].queue[response.data[0].queuePosition]
      let vtuber = video.split(' ')[0]

      if (vtuber === 'CHROME') {
        twitch_shoutout(twitch_id.get('chromevt'))
        client.say(
          '#satellitemoe',
          '¿Quieres ver mas de Chrome Cottontail y enterarte cada vez que este en vivo? Puedes seguirla en https://twitch.tv/chromevt',
        )
      }

      if (vtuber === 'ECLIPSE') {
        twitch_shoutout(twitch_id.get('eclipsenoctis'))
        client.say(
          '#satellitemoe',
          '¿Quieres ver mas de Eclipse Noctis y enterarte cada vez que este en vivo? Puedes seguirlo en https://twitch.tv/eclipsenoctis',
        )
      }

      if (vtuber === 'MAGIC') {
        twitch_shoutout(twitch_id.get('magicgladius'))
        client.say('#satellitemoe', '¿Quieres ver mas de MagicGladius y enterarte cada vez que este en vivo? Puedes seguirlo en https://twitch.tv/magicgladius')
      }

      if (vtuber === 'SEBA') {
        twitch_shoutout(twitch_id.get('sebascontre'))
        client.say('#satellitemoe', '¿Quieres ver mas de SebasContre y enterarte cada vez que este en vivo? Puedes seguirlo en https://twitch.tv/sebascontre')
      }

      if (vtuber === 'YAMI') {
        twitch_shoutout(twitch_id.get('itsyamivt'))
        client.say('#satellitemoe', '¿Quieres ver mas de Yami y enterarte cada vez que este en vivo? Puedes seguirla en https://twitch.tv/itsyamivt')
      }

      console.log(vtuber)
    })

  return { shout: 'done' }
})

fastify.get('/ping', async (req, res) => {
  return { ping: 'pong' }
})

const start = async () => {
  try {
    await fastify.listen({ port: port, host: '0.0.0.0' })
    console.log('Servidor iniciado')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

function twitch_shoutout(to: any, from = '1198464206') {
  axios.post(
    'https://api.twitch.tv/helix/chat/shoutouts',
    qs.stringify({
      from_broadcaster_id: from,
      to_broadcaster_id: to,
      moderator_id: from,
    }),
    twitch_headers,
  )
}
