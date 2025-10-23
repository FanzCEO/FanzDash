// FanzDash Integration Client
class FanzDashClient {
  private serviceManifest: any
  private fanzdashUrl: string
  private heartbeatInterval: NodeJS.Timeout | null = null
  
  constructor() {
    this.fanzdashUrl = process.env.FANZDASH_URL || 'http://localhost:5000'
    this.serviceManifest = {
      name: 'FanzDash',
      version: process.env.npm_package_version || '1.0.0',
      endpoints: ['/healthz', '/system', '/docs', '/version'],
      status: 'healthy',
      lastHeartbeat: new Date().toISOString()
    }
  }
  
  async register(): Promise<void> {
    try {
      const response = await fetch(`${this.fanzdashUrl}/introspect/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FANZDASH_TOKEN}`
        },
        body: JSON.stringify(this.serviceManifest)
      })
      
      if (response.ok) {
        console.log('✅ Successfully registered with FanzDash')
        this.startHeartbeat()
      } else {
        console.error('❌ Failed to register with FanzDash:', response.statusText)
      }
    } catch (error) {
      console.error('❌ Error registering with FanzDash:', error)
    }
  }
  
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      try {
        const heartbeat = {
          service: this.serviceManifest.name,
          status: 'healthy',
          timestamp: new Date().toISOString(),
          metrics: {
            memory: process.memoryUsage(),
            uptime: process.uptime()
          }
        }
        
        await fetch(`${this.fanzdashUrl}/api/heartbeat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.FANZDASH_TOKEN}`
          },
          body: JSON.stringify(heartbeat)
        })
      } catch (error) {
        console.warn('⚠️ Heartbeat failed:', error)
      }
    }, 30000) // Every 30 seconds
  }
  
  async shutdown(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    
    try {
      await fetch(`${this.fanzdashUrl}/api/service/${this.serviceManifest.name}/shutdown`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FANZDASH_TOKEN}`
        }
      })
      console.log('✅ Service unregistered from FanzDash')
    } catch (error) {
      console.error('❌ Error during shutdown:', error)
    }
  }
}

export const fanzdashClient = new FanzDashClient()

// Auto-register when module loads
if (process.env.NODE_ENV !== 'test') {
  fanzdashClient.register()
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await fanzdashClient.shutdown()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await fanzdashClient.shutdown()  
  process.exit(0)
})
