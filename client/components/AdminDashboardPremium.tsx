'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertTriangle, Shield, TrendingUp, Users, DollarSign, Activity,
  Server, Database, Globe, Lock, Zap, AlertCircle, CheckCircle,
  Clock, BarChart3, PieChart, LineChart, Eye, UserPlus,
  CreditCard, ShoppingCart, MessageSquare, Settings,
  Crown, Sparkles, Target, Rocket, Star
} from 'lucide-react';

/**
 * Premium Admin Dashboard Component
 * Based on futuristic dashboard design from attached assets
 * Integrates with all backend systems: AI CFO, Finance OS, Universal Hub, Control Center
 */

interface DashboardMetrics {
  overview: {
    totalUsers: number;
    activeCreators: number;
    totalRevenue24h: number;
    totalPayouts24h: number;
    activeAlerts: number;
    systemHealth: 'healthy' | 'degraded' | 'critical';
  };
  platforms: {
    [platformId: string]: {
      name: string;
      isActive: boolean;
      users: number;
      creators: number;
      revenue24h: number;
      transactions24h: number;
      lastUpdate: Date;
    };
  };
  financial: {
    cashBalance: number;
    pendingPayouts: number;
    monthlyRevenue: number;
    profitMargin: number;
    chargebackRate: number;
    averageTransaction: number;
  };
  compliance: {
    kycPendingReviews: number;
    taxDocumentsPending: number;
    violationsActive: number;
    auditScore: number;
    lastComplianceCheck: Date;
  };
  security: {
    activeThreats: number;
    suspendedUsers: number;
    failedLogins24h: number;
    vaultIntegrity: 'secure' | 'compromised';
    lastSecurityScan: Date;
  };
}

interface CFOBrief {
  briefType: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  generatedAt: Date;
  executiveSummary: {
    keyTakeaways: string[];
    criticalAlerts: any[];
    performanceHighlights: string[];
    riskAssessment: string;
  };
  financialAnalytics: {
    totalRevenue: number;
    revenueGrowth: number;
    profitMargin: number;
    burnRate: number;
    cashPosition: number;
    forecastAccuracy: number;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

interface SystemAlert {
  id: string;
  type: 'security' | 'financial' | 'compliance' | 'platform' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'resolved';
}

export function AdminDashboardPremium() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [cfoBrief, setCfoBrief] = useState<CFOBrief | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulated real-time data updates
  const fetchDashboardData = useCallback(async () => {
    try {
      // In production, these would be actual API calls to the backend systems
      const mockMetrics: DashboardMetrics = {
        overview: {
          totalUsers: 127849,
          activeCreators: 8934,
          totalRevenue24h: 48500,
          totalPayouts24h: 32500,
          activeAlerts: 3,
          systemHealth: 'healthy'
        },
        platforms: {
          boyfanz: { name: 'BoyFanz', isActive: true, users: 25840, creators: 1834, revenue24h: 12400, transactions24h: 340, lastUpdate: new Date() },
          girlfanz: { name: 'GirlFanz', isActive: true, users: 34200, creators: 2450, revenue24h: 15800, transactions24h: 420, lastUpdate: new Date() },
          pupfanz: { name: 'PupFanz', isActive: true, users: 18500, creators: 1250, revenue24h: 8900, transactions24h: 280, lastUpdate: new Date() },
          transfanz: { name: 'TransFanz', isActive: true, users: 22300, creators: 1800, revenue24h: 11400, transactions24h: 310, lastUpdate: new Date() },
          taboofanz: { name: 'TabooFanz', isActive: true, users: 15600, creators: 980, revenue24h: 9200, transactions24h: 220, lastUpdate: new Date() },
          fanztube: { name: 'FanzTube', isActive: true, users: 45200, creators: 3200, revenue24h: 18700, transactions24h: 580, lastUpdate: new Date() }
        },
        financial: {
          cashBalance: 2847000,
          pendingPayouts: 275000,
          monthlyRevenue: 1250000,
          profitMargin: 0.23,
          chargebackRate: 0.015,
          averageTransaction: 45.50
        },
        compliance: {
          kycPendingReviews: 156,
          taxDocumentsPending: 23,
          violationsActive: 3,
          auditScore: 94,
          lastComplianceCheck: new Date()
        },
        security: {
          activeThreats: 0,
          suspendedUsers: 45,
          failedLogins24h: 123,
          vaultIntegrity: 'secure',
          lastSecurityScan: new Date()
        }
      };

      const mockCFOBrief: CFOBrief = {
        briefType: 'daily',
        generatedAt: new Date(),
        executiveSummary: {
          keyTakeaways: [
            'Revenue growth of 12.8% compared to last period',
            'Creator retention at 89.4%, above industry average',
            'Platform performance stable across all clusters'
          ],
          criticalAlerts: [],
          performanceHighlights: [
            'BoyFanz engagement increased 15%',
            'New creator onboarding up 22%'
          ],
          riskAssessment: 'Overall risk level: LOW - No critical issues detected'
        },
        financialAnalytics: {
          totalRevenue: 48500,
          revenueGrowth: 12.8,
          profitMargin: 23.4,
          burnRate: 8200,
          cashPosition: 2847000,
          forecastAccuracy: 94.2
        },
        recommendations: {
          immediate: ['Monitor BoyFanz growth surge', 'Review payout processing'],
          shortTerm: ['Optimize creator acquisition', 'Enhance mobile experience'],
          longTerm: ['Expand international markets', 'Develop NFT marketplace']
        }
      };

      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'financial',
          severity: 'medium',
          title: 'Large Payout Pending',
          description: 'Creator payout of $15,000 requires approval',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'active'
        },
        {
          id: '2',
          type: 'compliance',
          severity: 'low',
          title: 'KYC Review Due',
          description: '25 creators pending KYC verification',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          id: '3',
          type: 'platform',
          severity: 'low',
          title: 'Content Moderation',
          description: '12 items in moderation queue',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          status: 'active'
        }
      ];

      setMetrics(mockMetrics);
      setCfoBrief(mockCFOBrief);
      setAlerts(mockAlerts);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  const getPlatformThemeColor = (platformId: string) => {
    const themes: Record<string, string> = {
      boyfanz: 'from-red-500/20 to-pink-500/20 border-red-500/30',
      girlfanz: 'from-pink-500/20 to-purple-500/20 border-pink-500/30',
      pupfanz: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      transfanz: 'from-teal-500/20 to-cyan-500/20 border-teal-500/30',
      taboofanz: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30',
      fanztube: 'from-orange-500/20 to-red-500/20 border-orange-500/30'
    };
    return themes[platformId] || 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
  };

  if (loading || !metrics) {
    return (
      <div className="min-h-screen bg-black/95 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500/30 rounded-full animate-spin border-t-cyan-400"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/30 rounded-full animate-ping"></div>
          </div>
          <div className="text-cyan-400 text-xl font-semibold">Loading FanzDash Control Center...</div>
          <div className="text-slate-400 text-sm">Initializing AI systems and real-time data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white">
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-sm bg-black/50 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Shield className="w-8 h-8 text-cyan-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                FanzDash Control Center
              </h1>
              <p className="text-sm text-slate-400">
                AI-Powered Ecosystem Management • Last Update: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* System Health Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">All Systems Operational</span>
            </div>
            
            {/* Emergency Actions */}
            <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency
            </Button>

            {/* Admin Avatar */}
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8 border-2 border-purple-500/50">
                <AvatarImage src="/api/placeholder/32/32" alt="Admin" />
                <AvatarFallback className="bg-purple-500/20 text-purple-400">
                  <Crown className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="text-white font-medium">Super Admin</div>
                <div className="text-slate-400 text-xs">Level 5 Clearance</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Real-time Status Banner */}
      <div className="bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 border-y border-green-500/30 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400 font-medium">99.9% Uptime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-300">2.8M+ API Calls Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-300">Last Update: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
            <span className="text-sm text-yellow-400 font-medium">AI CFO Active</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-white">{formatNumber(metrics.overview.totalUsers)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-green-400 text-sm">+12% this month</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">24h Revenue</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(metrics.overview.totalRevenue24h)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-green-400 text-sm">+23% vs yesterday</span>
                  </div>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Creators */}
          <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Creators</p>
                  <p className="text-3xl font-bold text-white">{formatNumber(metrics.overview.activeCreators)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-green-400 text-sm">+18% growth</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <Star className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">System Health</p>
                  <p className="text-3xl font-bold text-green-400">98.7%</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-green-400 text-sm">All systems go</span>
                  </div>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <Activity className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-700/50 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              Overview
            </TabsTrigger>
            <TabsTrigger value="platforms" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              Platforms
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              Financial
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
              Security
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              Compliance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI CFO Brief */}
              <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-cyan-400">
                    <Sparkles className="w-5 h-5 mr-2" />
                    AI CFO Daily Brief
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cfoBrief && (
                    <>
                      <div>
                        <h4 className="text-white font-medium mb-2">Key Takeaways</h4>
                        <ul className="space-y-1">
                          {cfoBrief.executiveSummary.keyTakeaways.map((takeaway, index) => (
                            <li key={index} className="text-sm text-slate-300 flex items-start">
                              <CheckCircle className="w-3 h-3 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                              {takeaway}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium mb-2">Financial Analytics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-800/50 rounded-lg">
                            <p className="text-xs text-slate-400">Revenue Growth</p>
                            <p className="text-lg font-bold text-green-400">+{cfoBrief.financialAnalytics.revenueGrowth}%</p>
                          </div>
                          <div className="p-3 bg-slate-800/50 rounded-lg">
                            <p className="text-xs text-slate-400">Profit Margin</p>
                            <p className="text-lg font-bold text-blue-400">{cfoBrief.financialAnalytics.profitMargin}%</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium mb-2">AI Recommendations</h4>
                        <div className="space-y-2">
                          {cfoBrief.recommendations.immediate.slice(0, 2).map((rec, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <Target className="w-3 h-3 text-orange-400 mr-2" />
                              <span className="text-slate-300">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* System Alerts */}
              <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-400">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Active Alerts ({alerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 bg-slate-800/30 rounded-lg">
                        <Badge className={`mt-0.5 ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{alert.title}</p>
                          <p className="text-xs text-slate-400">{alert.description}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {alerts.length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                        <p className="text-green-400 font-medium">No Active Alerts</p>
                        <p className="text-sm text-slate-400">All systems operating normally</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(metrics.platforms).map(([platformId, platform]) => (
                <Card key={platformId} className={`bg-gradient-to-br ${getPlatformThemeColor(platformId)} backdrop-blur-sm`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{platform.name}</h3>
                      <div className={`w-3 h-3 rounded-full ${platform.isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Users</p>
                        <p className="text-xl font-bold text-white">{formatNumber(platform.users)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Creators</p>
                        <p className="text-xl font-bold text-white">{formatNumber(platform.creators)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">24h Revenue</p>
                        <p className="text-lg font-bold text-green-400">{formatCurrency(platform.revenue24h)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Transactions</p>
                        <p className="text-lg font-bold text-cyan-400">{formatNumber(platform.transactions24h)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <Button size="sm" variant="outline" className="text-xs">
                        <Settings className="w-3 h-3 mr-1" />
                        Manage
                      </Button>
                      <span className="text-xs text-slate-400">
                        Updated: {platform.lastUpdate.toLocaleTimeString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Additional tabs would be implemented similarly... */}
          
          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Cash Balance</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(metrics.financial.cashBalance)}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border-orange-500/30">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Pending Payouts</p>
                  <p className="text-2xl font-bold text-orange-400">{formatCurrency(metrics.financial.pendingPayouts)}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Profit Margin</p>
                  <p className="text-2xl font-bold text-blue-400">{(metrics.financial.profitMargin * 100).toFixed(1)}%</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
                <CardContent className="p-6 text-center">
                  <CreditCard className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Avg Transaction</p>
                  <p className="text-2xl font-bold text-purple-400">{formatCurrency(metrics.financial.averageTransaction)}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs would continue similarly... */}
        </Tabs>
      </div>
    </div>
  );
}