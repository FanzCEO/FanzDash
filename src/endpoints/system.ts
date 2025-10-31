// System metrics endpoint for react application
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const system = {
      service: {
        name: 'FanzDash',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      },
      health: {
        status: 'operational',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      },
      metrics: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        pid: process.pid
      },
      endpoints: [
        '/healthz',
        '/system',
        '/docs',
        '/version'
      ],
      database: {
        status: 'connected' // Add actual DB check here
      },
      integrations: {
        fanzdash: {
          registered: true,
          lastHeartbeat: new Date().toISOString()
        }
      }
    }
    
    return NextResponse.json(system)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
