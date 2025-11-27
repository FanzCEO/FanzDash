import { db } from "../db";
import { userRelationships, networkAnalysis, users } from "@shared/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import OpenAI from "openai";

// 📊 GRAPH DATABASE INTELLIGENCE - Advanced Relationship & Network Analysis

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface NetworkGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  communities: Community[];
  centralityScores: CentralityScores;
  anomalies: NetworkAnomaly[];
}

export interface GraphNode {
  id: string;
  type: 'user' | 'content' | 'platform';
  properties: Record<string, any>;
  centrality: {
    degree: number;
    betweenness: number;
    closeness: number;
    eigenvector: number;
  };
  riskScore: number;
  communityId?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'follows' | 'interacts' | 'shares' | 'reports' | 'blocks' | 'suspicious';
  weight: number;
  properties: Record<string, any>;
  timestamp: Date;
}

export interface Community {
  id: string;
  members: string[];
  type: 'organic' | 'coordinated' | 'bot_network' | 'influence_cluster';
  cohesion: number;
  suspiciousActivity: boolean;
  characteristics: string[];
}

export interface CentralityScores {
  [userId: string]: {
    degree: number;
    betweenness: number;
    closeness: number;
    eigenvector: number;
    pagerank: number;
  };
}

export interface NetworkAnomaly {
  type: 'coordinated_behavior' | 'bot_network' | 'influence_operation' | 'sudden_growth' | 'mass_reporting';
  severity: 'low' | 'medium' | 'high' | 'critical';
  participants: string[];
  confidence: number;
  description: string;
  evidence: any[];
  timestamp: Date;
}

export interface InfluenceAnalysis {
  userId: string;
  influenceScore: number;
  reachEstimate: number;
  viralPotential: number;
  accountabilityRisk: number;
  recommendedActions: string[];
}

export class GraphIntelligenceEngine {
  private static readonly MIN_RELATIONSHIP_STRENGTH = 0.1;
  private static readonly COMMUNITY_SIZE_THRESHOLD = 5;
  private static readonly ANOMALY_CONFIDENCE_THRESHOLD = 0.75;

  // Main entry point for graph analysis
  static async analyzeNetwork(
    centerUserId?: string,
    depth: number = 2,
    analysisType: 'full' | 'focused' | 'threat' = 'full'
  ): Promise<NetworkGraph> {
    try {
      // Build the graph structure
      const graph = await this.buildNetworkGraph(centerUserId, depth);
      
      // Calculate centrality scores
      graph.centralityScores = this.calculateCentralityScores(graph);
      
      // Detect communities
      graph.communities = await this.detectCommunities(graph);
      
      // Identify anomalies
      graph.anomalies = await this.detectNetworkAnomalies(graph);
      
      // Store analysis results
      await this.storeNetworkAnalysis({
        analysisType,
        graph,
        centerUserId,
        depth,
      });

      return graph;
    } catch (error) {
      console.error('Graph analysis failed:', error);
      return {
        nodes: [],
        edges: [],
        communities: [],
        centralityScores: {},
        anomalies: [],
      };
    }
  }

  // Build network graph from database relationships
  private static async buildNetworkGraph(
    centerUserId?: string,
    depth: number = 2
  ): Promise<NetworkGraph> {
    try {
      let userIds: string[] = [];
      
      if (centerUserId) {
        // Start from specific user and expand outward
        userIds = await this.expandFromUser(centerUserId, depth);
      } else {
        // Analyze full network (limited sample for performance)
        const allUsers = await db
          .select({ id: users.id })
          .from(users)
          .limit(1000); // Sample for performance
        
        userIds = allUsers.map(u => u.id);
      }

      // Get relationships between these users
      const relationships = await db
        .select()
        .from(userRelationships)
        .where(
          and(
            inArray(userRelationships.sourceUserId, userIds),
            inArray(userRelationships.targetUserId, userIds)
          )
        );

      // Build nodes
      const nodes: GraphNode[] = await Promise.all(
        userIds.map(async (userId) => {
          const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
          const userRelCount = relationships.filter(r => 
            r.sourceUserId === userId || r.targetUserId === userId
          ).length;

          return {
            id: userId,
            type: 'user' as const,
            properties: {
              username: user[0]?.username || 'unknown',
              role: user[0]?.role || 'user',
              createdAt: user[0]?.createdAt,
              relationshipCount: userRelCount,
            },
            centrality: { degree: 0, betweenness: 0, closeness: 0, eigenvector: 0 },
            riskScore: 0,
          };
        })
      );

      // Build edges
      const edges: GraphEdge[] = relationships.map(rel => ({
        source: rel.sourceUserId,
        target: rel.targetUserId,
        type: rel.relationshipType as any,
        weight: Number(rel.strength) || 1,
        properties: {
          interactionCount: rel.interactionCount,
          riskFlags: rel.riskFlags || [],
        },
        timestamp: rel.createdAt || new Date(),
      }));

      return {
        nodes,
        edges,
        communities: [],
        centralityScores: {},
        anomalies: [],
      };
    } catch (error) {
      console.error('Failed to build network graph:', error);
      throw error;
    }
  }

  // Expand network from a specific user
  private static async expandFromUser(userId: string, depth: number): Promise<string[]> {
    const visited = new Set<string>();
    const toVisit = [userId];
    let currentDepth = 0;

    while (toVisit.length > 0 && currentDepth < depth) {
      const currentLevelSize = toVisit.length;
      
      for (let i = 0; i < currentLevelSize; i++) {
        const currentUser = toVisit.shift()!;
        if (visited.has(currentUser)) continue;
        
        visited.add(currentUser);
        
        // Get all connections for this user
        const connections = await db
          .select()
          .from(userRelationships)
          .where(
            and(
              eq(userRelationships.sourceUserId, currentUser),
              sql`${userRelationships.strength} >= ${this.MIN_RELATIONSHIP_STRENGTH}`
            )
          )
          .limit(50); // Limit to prevent explosion
        
        for (const conn of connections) {
          if (!visited.has(conn.targetUserId)) {
            toVisit.push(conn.targetUserId);
          }
        }
      }
      
      currentDepth++;
    }

    return Array.from(visited);
  }

  // Calculate various centrality measures
  private static calculateCentralityScores(graph: NetworkGraph): CentralityScores {
    const scores: CentralityScores = {};
    
    // Initialize scores
    for (const node of graph.nodes) {
      scores[node.id] = {
        degree: 0,
        betweenness: 0,
        closeness: 0,
        eigenvector: 0,
        pagerank: 0,
      };
    }

    // Degree centrality (number of direct connections)
    for (const edge of graph.edges) {
      scores[edge.source].degree += edge.weight;
      scores[edge.target].degree += edge.weight;
    }

    // Betweenness centrality (simplified approximation)
    this.calculateBetweennessCentrality(graph, scores);
    
    // PageRank (simplified implementation)
    this.calculatePageRank(graph, scores);
    
    // Update node centrality scores
    for (const node of graph.nodes) {
      node.centrality = scores[node.id];
    }

    return scores;
  }

  // Simplified betweenness centrality calculation
  private static calculateBetweennessCentrality(graph: NetworkGraph, scores: CentralityScores) {
    // For each pair of nodes, find shortest paths and count how many go through each node
    const adjacencyList = this.buildAdjacencyList(graph);
    
    for (const sourceNode of graph.nodes) {
      const distances = this.dijkstra(adjacencyList, sourceNode.id);
      
      for (const targetNode of graph.nodes) {
        if (sourceNode.id === targetNode.id) continue;
        
        // Simple approximation: nodes with high degree get higher betweenness
        const pathCount = this.countShortestPaths(adjacencyList, sourceNode.id, targetNode.id);
        
        for (const intermediateNode of graph.nodes) {
          if (intermediateNode.id === sourceNode.id || intermediateNode.id === targetNode.id) continue;
          
          // If this node is on a shortest path, increase its betweenness
          if (this.isOnShortestPath(adjacencyList, sourceNode.id, intermediateNode.id, targetNode.id)) {
            scores[intermediateNode.id].betweenness += 1 / pathCount;
          }
        }
      }
    }
  }

  // Simplified PageRank calculation
  private static calculatePageRank(graph: NetworkGraph, scores: CentralityScores, iterations: number = 10) {
    const dampingFactor = 0.85;
    const numNodes = graph.nodes.length;
    
    // Initialize PageRank scores
    for (const node of graph.nodes) {
      scores[node.id].pagerank = 1 / numNodes;
    }
    
    // Iterative calculation
    for (let i = 0; i < iterations; i++) {
      const newScores: { [key: string]: number } = {};
      
      for (const node of graph.nodes) {
        newScores[node.id] = (1 - dampingFactor) / numNodes;
        
        // Sum contributions from incoming edges
        const incomingEdges = graph.edges.filter(e => e.target === node.id);
        for (const edge of incomingEdges) {
          const outDegree = graph.edges.filter(e => e.source === edge.source).length;
          newScores[node.id] += dampingFactor * (scores[edge.source].pagerank / outDegree);
        }
      }
      
      // Update scores
      for (const node of graph.nodes) {
        scores[node.id].pagerank = newScores[node.id];
      }
    }
  }

  // Detect communities using advanced algorithms
  private static async detectCommunities(graph: NetworkGraph): Promise<Community[]> {
    try {
      // Use modularity-based community detection (simplified)
      const communities = this.modularityBasedCommunityDetection(graph);
      
      // Analyze each community for suspicious patterns
      const analyzedCommunities = await Promise.all(
        communities.map(async (community) => this.analyzeCommunity(community, graph))
      );

      return analyzedCommunities;
    } catch (error) {
      console.error('Community detection failed:', error);
      return [];
    }
  }

  // Simplified modularity-based community detection
  private static modularityBasedCommunityDetection(graph: NetworkGraph): Community[] {
    const communities: Community[] = [];
    const visited = new Set<string>();
    let communityId = 0;

    for (const node of graph.nodes) {
      if (visited.has(node.id)) continue;
      
      const communityMembers = this.findConnectedComponent(graph, node.id, visited);
      
      if (communityMembers.length >= this.COMMUNITY_SIZE_THRESHOLD) {
        communities.push({
          id: `community_${communityId++}`,
          members: communityMembers,
          type: 'organic',
          cohesion: this.calculateCohesion(graph, communityMembers),
          suspiciousActivity: false,
          characteristics: [],
        });
      }
    }

    return communities;
  }

  // Find connected components using DFS
  private static findConnectedComponent(
    graph: NetworkGraph,
    startNode: string,
    visited: Set<string>
  ): string[] {
    const component: string[] = [];
    const stack = [startNode];
    
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (visited.has(node)) continue;
      
      visited.add(node);
      component.push(node);
      
      // Add neighbors to stack
      const neighbors = graph.edges
        .filter(e => e.source === node || e.target === node)
        .map(e => e.source === node ? e.target : e.source)
        .filter(n => !visited.has(n));
      
      stack.push(...neighbors);
    }
    
    return component;
  }

  // Calculate community cohesion
  private static calculateCohesion(graph: NetworkGraph, members: string[]): number {
    const memberSet = new Set(members);
    let internalEdges = 0;
    let totalPossibleEdges = 0;
    
    for (const edge of graph.edges) {
      if (memberSet.has(edge.source) && memberSet.has(edge.target)) {
        internalEdges++;
      }
    }
    
    totalPossibleEdges = (members.length * (members.length - 1)) / 2;
    
    return totalPossibleEdges > 0 ? internalEdges / totalPossibleEdges : 0;
  }

  // Analyze community for suspicious patterns
  private static async analyzeCommunity(community: Community, graph: NetworkGraph): Promise<Community> {
    try {
      const characteristics: string[] = [];
      let suspiciousActivity = false;

      // Check for bot-like behavior patterns
      const botScore = this.calculateBotScore(community, graph);
      if (botScore > 0.7) {
        characteristics.push('potential_bot_network');
        suspiciousActivity = true;
        community.type = 'bot_network';
      }

      // Check for coordinated behavior
      const coordinationScore = this.calculateCoordinationScore(community, graph);
      if (coordinationScore > 0.8) {
        characteristics.push('coordinated_behavior');
        suspiciousActivity = true;
        community.type = 'coordinated';
      }

      // Check for influence operations
      const influenceScore = await this.calculateInfluenceScore(community, graph);
      if (influenceScore > 0.7) {
        characteristics.push('influence_operation');
        community.type = 'influence_cluster';
      }

      community.characteristics = characteristics;
      community.suspiciousActivity = suspiciousActivity;

      return community;
    } catch (error) {
      console.error('Community analysis failed:', error);
      return community;
    }
  }

  // Calculate bot likelihood for community
  private static calculateBotScore(community: Community, graph: NetworkGraph): number {
    let botIndicators = 0;
    const totalMembers = community.members.length;

    for (const memberId of community.members) {
      const node = graph.nodes.find(n => n.id === memberId);
      if (!node) continue;

      // Check for bot-like patterns
      const creationTime = new Date(node.properties.createdAt);
      const accountAge = Date.now() - creationTime.getTime();
      const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);

      // New accounts are more suspicious
      if (daysSinceCreation < 30) botIndicators += 0.3;
      
      // High activity with low relationship diversity
      const relationshipTypes = new Set(
        graph.edges
          .filter(e => e.source === memberId || e.target === memberId)
          .map(e => e.type)
      );
      
      if (node.properties.relationshipCount > 50 && relationshipTypes.size < 3) {
        botIndicators += 0.4;
      }
    }

    return Math.min(1, botIndicators / totalMembers);
  }

  // Calculate coordination score
  private static calculateCoordinationScore(community: Community, graph: NetworkGraph): number {
    // Look for synchronized behavior patterns
    const memberActivities = community.members.map(memberId => {
      const edges = graph.edges.filter(e => e.source === memberId);
      return {
        memberId,
        activityTimes: edges.map(e => e.timestamp.getTime()),
        targets: edges.map(e => e.target),
      };
    });

    // Check for synchronized posting times
    let coordinationScore = 0;
    const timeWindows = this.findTimeWindows(memberActivities);
    
    if (timeWindows.length > 0) {
      const avgMembersPerWindow = timeWindows.reduce((sum, w) => sum + w.memberCount, 0) / timeWindows.length;
      coordinationScore = Math.min(1, avgMembersPerWindow / community.members.length);
    }

    return coordinationScore;
  }

  // Calculate influence operation score
  private static async calculateInfluenceScore(community: Community, graph: NetworkGraph): Promise<number> {
    try {
      // Use AI to analyze community patterns
      const communityData = {
        size: community.members.length,
        cohesion: community.cohesion,
        centralityScores: community.members.map(id => 
          graph.nodes.find(n => n.id === id)?.centrality
        ),
        relationshipTypes: graph.edges
          .filter(e => community.members.includes(e.source) || community.members.includes(e.target))
          .map(e => e.type),
      };

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{
          role: "system",
          content: "You are an expert in detecting influence operations and coordinated inauthentic behavior in social networks."
        }, {
          role: "user",
          content: `Analyze this community for influence operation patterns:
          
          ${JSON.stringify(communityData, null, 2)}
          
          Look for:
          - Artificial amplification patterns
          - Coordinated messaging
          - Inauthentic behavior
          - State-sponsored characteristics
          
          Return JSON: { "influenceScore": number (0-1), "reasoning": "explanation" }`
        }],
        response_format: { type: "json_object" },
        max_tokens: 500,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return analysis.influenceScore || 0;
    } catch (error) {
      console.error('AI influence analysis failed:', error);
      return 0;
    }
  }

  // Detect network anomalies
  private static async detectNetworkAnomalies(graph: NetworkGraph): Promise<NetworkAnomaly[]> {
    const anomalies: NetworkAnomaly[] = [];

    // Detect sudden network growth
    const growthAnomaly = this.detectSuddenGrowth(graph);
    if (growthAnomaly) anomalies.push(growthAnomaly);

    // Detect coordinated behavior
    const coordBehavior = await this.detectCoordinatedBehavior(graph);
    if (coordBehavior) anomalies.push(coordBehavior);

    // Detect bot networks
    const botNetwork = this.detectBotNetworks(graph);
    if (botNetwork) anomalies.push(botNetwork);

    return anomalies.filter(a => a.confidence >= this.ANOMALY_CONFIDENCE_THRESHOLD);
  }

  // Store analysis results in database
  private static async storeNetworkAnalysis(data: {
    analysisType: string;
    graph: NetworkGraph;
    centerUserId?: string;
    depth: number;
  }) {
    try {
      await db.insert(networkAnalysis).values({
        analysisType: data.analysisType,
        networkId: data.centerUserId || 'global',
        participants: data.graph.nodes.map(n => n.id),
        centralityScores: data.graph.centralityScores,
        communityDetection: data.graph.communities,
        anomalyScore: data.graph.anomalies.length > 0 
          ? Math.max(...data.graph.anomalies.map(a => a.confidence))
          : 0,
        findings: {
          nodeCount: data.graph.nodes.length,
          edgeCount: data.graph.edges.length,
          communityCount: data.graph.communities.length,
          anomalyCount: data.graph.anomalies.length,
        },
        actionRequired: data.graph.anomalies.some(a => a.severity === 'critical'),
      });
    } catch (error) {
      console.error('Failed to store network analysis:', error);
    }
  }

  // Utility methods
  private static buildAdjacencyList(graph: NetworkGraph): { [key: string]: string[] } {
    const adj: { [key: string]: string[] } = {};
    
    for (const node of graph.nodes) {
      adj[node.id] = [];
    }
    
    for (const edge of graph.edges) {
      adj[edge.source] = adj[edge.source] || [];
      adj[edge.target] = adj[edge.target] || [];
      adj[edge.source].push(edge.target);
      adj[edge.target].push(edge.source);
    }
    
    return adj;
  }

  private static dijkstra(adjacencyList: { [key: string]: string[] }, start: string): { [key: string]: number } {
    const distances: { [key: string]: number } = {};
    const visited = new Set<string>();
    const queue = [{ node: start, distance: 0 }];
    
    // Initialize distances
    for (const node in adjacencyList) {
      distances[node] = Infinity;
    }
    distances[start] = 0;
    
    while (queue.length > 0) {
      queue.sort((a, b) => a.distance - b.distance);
      const { node, distance } = queue.shift()!;
      
      if (visited.has(node)) continue;
      visited.add(node);
      
      for (const neighbor of adjacencyList[node] || []) {
        const newDistance = distance + 1;
        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance;
          queue.push({ node: neighbor, distance: newDistance });
        }
      }
    }
    
    return distances;
  }

  private static countShortestPaths(adjacencyList: { [key: string]: string[] }, start: string, end: string): number {
    // Simplified: return 1 for now
    return 1;
  }

  private static isOnShortestPath(adjacencyList: { [key: string]: string[] }, start: string, intermediate: string, end: string): boolean {
    // Simplified: check if intermediate is connected to both start and end
    return (adjacencyList[start] || []).includes(intermediate) && 
           (adjacencyList[intermediate] || []).includes(end);
  }

  private static findTimeWindows(memberActivities: any[]): { memberCount: number; window: [number, number] }[] {
    // Simplified implementation
    return [];
  }

  private static detectSuddenGrowth(graph: NetworkGraph): NetworkAnomaly | null {
    // Analyze recent edge creation patterns
    const recentEdges = graph.edges.filter(e => {
      const daysSinceCreation = (Date.now() - e.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation <= 7;
    });

    if (recentEdges.length > graph.edges.length * 0.3) {
      return {
        type: 'sudden_growth',
        severity: 'high',
        participants: [...new Set([...recentEdges.map(e => e.source), ...recentEdges.map(e => e.target)])],
        confidence: 0.8,
        description: `Detected ${recentEdges.length} new relationships in the past week`,
        evidence: recentEdges.slice(0, 10),
        timestamp: new Date(),
      };
    }

    return null;
  }

  private static async detectCoordinatedBehavior(graph: NetworkGraph): Promise<NetworkAnomaly | null> {
    // Look for groups of users with identical behavior patterns
    const behaviorPatterns = new Map<string, string[]>();
    
    for (const node of graph.nodes) {
      const connections = graph.edges.filter(e => e.source === node.id).map(e => e.target).sort();
      const pattern = connections.join(',');
      
      if (!behaviorPatterns.has(pattern)) {
        behaviorPatterns.set(pattern, []);
      }
      behaviorPatterns.get(pattern)!.push(node.id);
    }

    // Find patterns with multiple users (potential coordination)
    for (const [pattern, users] of behaviorPatterns) {
      if (users.length >= 5) {
        return {
          type: 'coordinated_behavior',
          severity: 'high',
          participants: users,
          confidence: 0.85,
          description: `Detected ${users.length} users with identical connection patterns`,
          evidence: [{ pattern, users: users.slice(0, 10) }],
          timestamp: new Date(),
        };
      }
    }

    return null;
  }

  private static detectBotNetworks(graph: NetworkGraph): NetworkAnomaly | null {
    // Look for clusters of newly created accounts with similar behavior
    const suspiciousUsers = graph.nodes.filter(node => {
      const creationTime = new Date(node.properties.createdAt);
      const daysSinceCreation = (Date.now() - creationTime.getTime()) / (1000 * 60 * 60 * 24);
      
      return daysSinceCreation < 30 && node.centrality.degree > 20;
    });

    if (suspiciousUsers.length >= 10) {
      return {
        type: 'bot_network',
        severity: 'critical',
        participants: suspiciousUsers.map(u => u.id),
        confidence: 0.9,
        description: `Detected potential bot network with ${suspiciousUsers.length} suspicious accounts`,
        evidence: suspiciousUsers.slice(0, 10).map(u => ({
          userId: u.id,
          accountAge: u.properties.createdAt,
          connectionCount: u.centrality.degree,
        })),
        timestamp: new Date(),
      };
    }

    return null;
  }

  // Public API methods
  static async analyzeUserInfluence(userId: string): Promise<InfluenceAnalysis> {
    try {
      const userGraph = await this.analyzeNetwork(userId, 3, 'focused');
      const userNode = userGraph.nodes.find(n => n.id === userId);
      
      if (!userNode) {
        throw new Error('User not found in graph');
      }

      const influenceScore = (
        userNode.centrality.degree * 0.3 +
        userNode.centrality.betweenness * 0.25 +
        userNode.centrality.pagerank * 0.25 +
        userNode.centrality.eigenvector * 0.2
      );

      const reachEstimate = Math.round(userNode.centrality.degree * 10);
      const viralPotential = userNode.centrality.betweenness;
      
      return {
        userId,
        influenceScore,
        reachEstimate,
        viralPotential,
        accountabilityRisk: userNode.riskScore,
        recommendedActions: this.generateInfluenceRecommendations(influenceScore, userNode.riskScore),
      };
    } catch (error) {
      console.error('Influence analysis failed:', error);
      throw error;
    }
  }

  private static generateInfluenceRecommendations(influenceScore: number, riskScore: number): string[] {
    const recommendations: string[] = [];
    
    if (influenceScore > 0.8) {
      recommendations.push('monitor_high_influence_activity');
    }
    
    if (riskScore > 0.7) {
      recommendations.push('enhanced_content_review');
    }
    
    if (influenceScore > 0.6 && riskScore > 0.5) {
      recommendations.push('restrict_viral_potential');
    }
    
    return recommendations;
  }

  // Get network analysis history
  static async getAnalysisHistory(limit: number = 10): Promise<any[]> {
    try {
      return await db
        .select()
        .from(networkAnalysis)
        .orderBy(desc(networkAnalysis.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Failed to get analysis history:', error);
      return [];
    }
  }
}

// Export types
export type { 
  NetworkGraph, 
  GraphNode, 
  GraphEdge, 
  Community, 
  NetworkAnomaly, 
  InfluenceAnalysis 
};