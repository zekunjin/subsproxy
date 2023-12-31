import { getAccountServers } from './index.get'
import { SS_PREFIX, VMESS_PREFIX, isShadowsocks, isVmess, renderTemplate } from '~/utils/common'

export interface XrayProxy {
  tag: string
  protocol: 'shadowsocks' | 'vmess'
  server: string
  port: string
  cipher: string
  password?: string
  uuid?: string
  alterId?: string
}

const parseVmess = (address: string) => {
  const decode = atob(address.replace(VMESS_PREFIX, ''))
  return JSON.parse(decode)
}

const parseShadowsocks = (address: string) => {
  const [encode] = address.replace(SS_PREFIX, '').split('#')
  const [method, _, port] = atob(encode).split(':')
  const [password, server] = _.split('@')

  return {
    server,
    password,
    method,
    port
  }
}

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const servers = await getAccountServers(event, id)

  const proxies: XrayProxy[] = []

  servers.forEach((server, index) => {
    if (isVmess(server.address)) {
      const conf = parseVmess(server.address)
      proxies.push({
        tag: `vmess-${index}`,
        protocol: 'vmess',
        server: conf.add,
        port: conf.port,
        cipher: 'auto',
        uuid: conf.id,
        alterId: conf.aid
      })
    }

    if (isShadowsocks(server.address)) {
      const conf = parseShadowsocks(server.address)
      proxies.push({
        tag: `ss-${index}`,
        protocol: 'shadowsocks',
        server: conf.server,
        port: conf.port,
        cipher: conf.method,
        password: conf.password
      })
    }
  })

  return renderTemplate('v2ray.config.json', { servers: proxies })
})
