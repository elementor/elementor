import { type AuditDescriptor, type AuditEvaluator } from './types';

type RegisteredAudit = {
	descriptor: AuditDescriptor;
	evaluator: AuditEvaluator;
};

const registry = new Map< string, RegisteredAudit >();

export function registerAudit( descriptor: AuditDescriptor, evaluator: AuditEvaluator ): void {
	registry.set( descriptor.id, { descriptor, evaluator } );
}

export function getRegistered(): RegisteredAudit[] {
	return Array.from( registry.values() );
}

export function hasEvaluator( id: string ): boolean {
	return registry.has( id );
}

export function clearRegistry(): void {
	registry.clear();
}
