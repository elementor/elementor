import { type Audit } from './types';

const registry = new Map< string, Audit >();

export function registerAudit( audit: Audit ): void {
	registry.set( audit.id, audit );
}

export function getRegisteredAudits(): Audit[] {
	return Array.from( registry.values() );
}

export function hasAudit( id: string ): boolean {
	return registry.has( id );
}

export function clearAuditRegistry(): void {
	registry.clear();
}
