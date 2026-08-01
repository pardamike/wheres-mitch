import type { PathNode, Vec2 } from '../core/types';

export interface RouteNode extends PathNode {
  depthLane: 'back' | 'mid' | 'front';
}

export interface RouteEdge {
  from: string;
  to: string;
  bidirectional?: boolean;
}

function distance(first: Vec2, second: Vec2): number {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export class PathNetwork {
  private readonly nodeMap = new Map<string, RouteNode>();
  private readonly adjacency = new Map<string, string[]>();

  constructor(nodes: readonly RouteNode[], edges: readonly RouteEdge[]) {
    for (const node of nodes) {
      if (!node.id || this.nodeMap.has(node.id)) {
        throw new Error(`Route nodes must have unique IDs: ${node.id || '(empty)'}`);
      }
      if (
        !Number.isFinite(node.x) ||
        !Number.isFinite(node.y) ||
        node.x < 0 ||
        node.x > 1440 ||
        node.y < 0 ||
        node.y > 900
      ) {
        throw new Error(`Route node ${node.id} has invalid stage coordinates.`);
      }
      if (!Number.isInteger(node.lane) || node.lane < 0) {
        throw new Error(`Route node ${node.id} has an invalid depth lane index.`);
      }
      if (!['back', 'mid', 'front'].includes(node.depthLane)) {
        throw new Error(`Route node ${node.id} has an invalid named depth lane.`);
      }
      this.nodeMap.set(node.id, { ...node });
      this.adjacency.set(node.id, []);
    }
    for (const edge of edges) {
      if (edge.bidirectional !== undefined && typeof edge.bidirectional !== 'boolean') {
        throw new Error(`Route edge ${edge.from} → ${edge.to} has an invalid direction flag.`);
      }
      this.addEdge(edge.from, edge.to);
      if (edge.bidirectional !== false) {
        this.addEdge(edge.to, edge.from);
      }
    }
  }

  get nodes(): readonly RouteNode[] {
    return Array.from(this.nodeMap.values());
  }

  getNode(id: string): RouteNode {
    const node = this.nodeMap.get(id);
    if (!node) {
      throw new Error(`Unknown route node: ${id}`);
    }
    return node;
  }

  neighbors(id: string): readonly string[] {
    const neighbors = this.adjacency.get(id);
    if (!neighbors) {
      throw new Error(`Unknown route node: ${id}`);
    }
    return neighbors;
  }

  findPath(startId: string, destinationId: string): string[] {
    this.getNode(startId);
    this.getNode(destinationId);
    if (startId === destinationId) {
      return [startId];
    }
    const frontier = [startId];
    const previous = new Map<string, string | null>([[startId, null]]);
    for (let index = 0; index < frontier.length; index += 1) {
      const current = frontier[index] as string;
      for (const neighbor of this.neighbors(current)) {
        if (previous.has(neighbor)) {
          continue;
        }
        previous.set(neighbor, current);
        if (neighbor === destinationId) {
          const path = [destinationId];
          let cursor: string | null = current;
          while (cursor) {
            path.push(cursor);
            cursor = previous.get(cursor) ?? null;
          }
          return path.reverse();
        }
        frontier.push(neighbor);
      }
    }
    throw new Error(`No valid route from ${startId} to ${destinationId}.`);
  }

  pathLength(path: readonly string[]): number {
    return path
      .slice(1)
      .reduce(
        (total, nodeId, index) =>
          total + distance(this.getNode(path[index] as string), this.getNode(nodeId)),
        0,
      );
  }

  isReachable(startId: string, destinationId: string): boolean {
    try {
      this.findPath(startId, destinationId);
      return true;
    } catch {
      return false;
    }
  }

  private addEdge(from: string, to: string): void {
    if (!this.nodeMap.has(from) || !this.nodeMap.has(to)) {
      throw new Error(`Route edge ${from} → ${to} references an unknown node.`);
    }
    const neighbors = this.adjacency.get(from) as string[];
    if (!neighbors.includes(to)) {
      neighbors.push(to);
    }
  }
}

export function moveTowards(
  start: Vec2,
  destination: Vec2,
  maximumDistance: number,
): { reached: boolean; travelled: number } {
  if (!Number.isFinite(maximumDistance) || maximumDistance < 0) {
    throw new Error('Movement distance must be a finite non-negative number.');
  }
  const remainingDistance = distance(start, destination);
  if (remainingDistance === 0 || maximumDistance >= remainingDistance) {
    start.x = destination.x;
    start.y = destination.y;
    return { reached: true, travelled: remainingDistance };
  }
  const ratio = maximumDistance / remainingDistance;
  start.x += (destination.x - start.x) * ratio;
  start.y += (destination.y - start.y) * ratio;
  return { reached: false, travelled: maximumDistance };
}
