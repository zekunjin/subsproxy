import { prisma } from '~/utils/prisma'

export default defineAuthenticatedEventHandler(() => {
  return prisma.account.findMany({
    select: {
      id: true,
      avatar: true,
      username: true,
      password: false,
      createdAt: true,
      updatedAt: true,
      accountSubscription: true
    }
  })
})
