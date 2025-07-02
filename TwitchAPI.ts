import axios from 'axios'
import qs from 'fast-querystring'
import { t } from 'try'

export class Twitch {
  private clientID: string
  private accessToken: string
  private cache_avatar: Map<string, string>

  constructor(clientID: string, accessToken: string) {
    this.clientID = clientID
    this.accessToken = accessToken

    this.cache_avatar = new Map()
  }

  private async getAPI(endpoint: string, params: object = {}) {
    try {
      const response = await axios.get(`https://api.twitch.tv/helix/${endpoint}`, {
        headers: {
          'Client-ID': this.clientID,
          Authorization: `Bearer ${this.accessToken}`,
        },
        params,
      })
      return response.data
    } catch (error) {
      console.error('Error fetching data from Twitch API:', error)
      throw error
    }
  }

  public async getUserByLogin(login: string) {
    const data = await this.getAPI('users', { login })
    return data.data[0] || null
  }

  public async getUserAvatar(login: string) {
    if (this.cache_avatar.has(login)) {
      return this.cache_avatar.get(login) as string
    }

    const user = await this.getUserByLogin(login)
    if (!user) {
      throw new Error(`User with login ${login} not found`)
    }

    const avatarUrl = user.profile_image_url
    this.cache_avatar.set(login, avatarUrl)
    return avatarUrl
  }

  public async twitch_shoutout(to: string, from: string = '1198464206') {
    try {
      await axios.post(
        'https://api.twitch.tv/helix/chat/shoutouts',
        qs.stringify({
          from_broadcaster_id: from,
          to_broadcaster_id: to,
          moderator_id: from,
        }),
        {
          headers: {
            'Client-ID': this.clientID,
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      )
    } catch (error) {
      console.error('Error sending shoutout:', error)
      throw error
    }
  }
}
