import { getElements } from '@elementor/editor-elements';

import { fetchPageContext } from './api/page-context-client';
import { getRegisteredAudits } from './registry';
import {
	type Audit,
	type AuditContext,
	type AuditMeta,
	type AuditRun,
	type ElementsModelSnapshot,
	type KitSnapshot,
	type PageAuditReport,
} from './types';
import { computeReport } from './utils/compute-report';
import { extractAttachmentIds } from './utils/page-attachments';
import { readKitSnapshot } from './utils/read-kit-snapshot';
import { buildSnapshotTree } from './utils/v1-snapshot';

export async function runPageAudit( documentId: number ): Promise< PageAuditReport > {
	const tree = buildSnapshotTree( getElements() );
	const attachmentIds = extractAttachmentIds( tree );
	const pageContext = await fetchPageContext( documentId, attachmentIds );

	const elements: ElementsModelSnapshot = { documentId, tree };
	const kit: KitSnapshot = await readKitSnapshot( pageContext.kit_id );

	const ctx: AuditContext = { documentId, elements, pageContext, kit };
	const registered = getRegisteredAudits();

	const auditResults: AuditRun[] = await Promise.all(
		registered.map( async ( audit ) => {
			const { evaluate: _evaluate, ...meta }: AuditMeta & Pick< Audit, 'evaluate' > = audit;
			try {
				const result = await audit.evaluate( ctx );
				return { audit: meta, result };
			} catch ( error ) {
				const reason = error instanceof Error ? error.message : 'unknown-error';
				return { audit: meta, result: { status: 'skipped' as const, reason } };
			}
		} )
	);

	return computeReport( documentId, auditResults );
}
