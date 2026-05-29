import { registerAudit } from './registry';
import { type AuditContext, type AuditDescriptor, type AuditResult } from './types';

export abstract class Audit {
	protected abstract descriptor(): AuditDescriptor;

	abstract evaluate( ctx: AuditContext ): AuditResult | Promise< AuditResult >;

	register(): void {
		registerAudit( this.descriptor(), ( ctx ) => this.evaluate( ctx ) );
	}
}
