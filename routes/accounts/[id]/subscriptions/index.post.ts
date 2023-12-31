import { z } from 'zod'
import { prisma } from '~/utils/prisma'

const AccountSubscription = z.object({
  subscriptionId: z.string()
})

export default defineAuthenticatedEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readBody<Required<z.infer<typeof AccountSubscription>>>(event)
  AccountSubscription.parse(body)

  const account = await prisma.account.findUnique({ where: { id } })
  if (!account) { throwBadRequestException() }

  const subscription = await prisma.subscription.findUnique({ where: { id: body.subscriptionId } })
  if (!subscription) { throwBadRequestException() }

  const exist = await prisma.accountSubscription.findFirst({ where: { accountId: id, subscriptionId: body.subscriptionId } })
  if (exist) { throwBadRequestException() }

  return prisma.accountSubscription.create({ data: { accountId: id, subscriptionId: body.subscriptionId } })
})
