import { env, serve } from 'bun'
import axios from 'axios'
import tmi, { type Client, type ChatUserstate } from 'tmi.js'
import { sendDiscordWebhook } from 'send-discord-webhook'
import { t } from 'try'

import { Twitch } from './TwitchAPI'
import { checkSatellite, raidMessage } from './messages'
import { traducirFollowAge } from './functions'

const TWITCH_ID: Map<string, number> = new Map([
  ['satellitemoe', 1198464206],
  ['chromevt', 155702183],
  ['eclipsenoctis', 916473359],
  ['itsyamivt', 641499175],
  ['magicgladius', 131183360],
  ['sebascontre', 36026178],
])

const twitch = new Twitch(env.TWITCH_CLIENT_ID, env.TWITCH_OAUTH)

const chat: Client = new tmi.Client({
  options: { debug: true },
  identity: { username: 'satellitemoe', password: env.TWITCH_OAUTH },
  channels: ['satellitemoe'],
})

chat.on('pong', async (latency: number): Promise<void> => {
  axios.get(`${env.CHATBOT_URL}/ping`)
  console.log('PONG enviado! Latencia: ' + latency)

  //console.log(await twitch.getUserByLogin('sebascontre'))
})

chat.on('raided', (channel: string, username: string, viewers: number) => {
  if (channel !== '#satellitemoe') return // Solo responde a raids en el canal de Satellite
  console.log(`¡${username} ha hecho raid con ${viewers} espectadores!`)
  chat.say(channel, raidMessage(username))
})

chat.on('message', async (channel: string, tags: ChatUserstate, message: string, self: boolean): Promise<void> => {
  if (channel === '#satellitemoe') {
    let [ok, error, value] = t(
      await sendDiscordWebhook({
        url: env.DISCORD_WEBHOOK,
        username: tags['display-name'],
        avatar_url: await twitch.getUserAvatar(tags.username as string),
        content: message,
      }),
    )
  }

  if (self) return
  let msg: string = message.toLowerCase()

  if (channel === '#satellitemoe') {
    if (msg.includes('!hola')) {
      chat.say(channel, `¡Hola ${tags['display-name']}! ¿Cómo estás?`)
    }

    if (msg.includes('!satellite')) {
      chat.say(channel, checkSatellite['satellitemoe'] as string)
    }

    if (message === '!followage') {
      axios
        .get(`https://decapi.me/twitch/followage/satellitemoe/${tags.username}?token=${process.env.DECAPI_TOKEN}`)
        .then(function (response) {
          chat.say(
            channel,
            `Increible, ${tags['display-name']} nos lleva siguiendo ${traducirFollowAge(response.data)}`,
          )
        })
    }
  }
})

serve({
  port: env.PORT,
  routes: {
    '/': Response.json({ hello: 'world' }) as Response,
    '/ping': Response.json({ ping: 'pong' }) as Response,
    '/shout': Response.json({ shout: 'not_done' }) as Response,
  },
  fetch(req: Request): Response {
    return new Response('Not Found', { status: 404 })
  },
})

chat.connect()
