import { getElements } from '@elementor/editor-elements';

import { fetchPageContext } from './api/page-context-client';
import { extractAttachmentIds } from './lib/attachment-ids';
import { buildSnapshotTree } from './lib/v1-snapshot';
import { getRegistered } from './registry';
import { computeReport } from './score/score';
import {
	type AuditContext,
	type AuditDescriptor,
	type AuditResult,
	type ElementsModelSnapshot,
	type KitSnapshot,
	type PageAuditReport,
} from './types';

export async function runPageAudit( documentId: number ): Promise< PageAuditReport > {
	const tree = buildSnapshotTree( getElements() );
	const attachmentIds = extractAttachmentIds( tree );
	const pageContext = await fetchPageContext( documentId, attachmentIds );

	const elements: ElementsModelSnapshot = { documentId, tree };
	const kit: KitSnapshot = readKitFromGlobals( pageContext.kit_id );

	const ctx: AuditContext = { documentId, elements, pageContext, kit };
	const registered = getRegistered();

	const auditResults: Array< { descriptor: AuditDescriptor; result: AuditResult } > = [];

	for ( const { descriptor, evaluator } of registered ) {
		try {
			const result = await Promise.resolve( evaluator( ctx ) );
			auditResults.push( { descriptor, result } );
		} catch ( error ) {
			auditResults.push( {
				descriptor,
				result: { status: 'skipped', reason: error instanceof Error ? error.message : 'unknown-error' },
			} );
		}
	}

	return computeReport( documentId, auditResults );
}

type ExtendedWindow = Window & {
	elementor?: {
		config?: {
			kit?: {
				system_colors?: Array< { _id: string; color: string } >;
				custom_colors?: Array< { _id: string; color: string } >;
				system_typography?: Array< { _id: string; title: string } >;
				custom_typography?: Array< { _id: string; title: string } >;
			};
		};
	};
};

function readKitFromGlobals( kitId: number ): KitSnapshot {
	const kit = ( window as unknown as ExtendedWindow ).elementor?.config?.kit ?? {};
	const colors = [ ...( kit.system_colors ?? [] ), ...( kit.custom_colors ?? [] ) ].map( ( c ) => ( {
		id: c._id,
		value: c.color,
	} ) );
	const fonts = [ ...( kit.system_typography ?? [] ), ...( kit.custom_typography ?? [] ) ].map( ( f ) => ( {
		id: f._id,
		value: f.title,
	} ) );

	return { id: kitId, globals: { colors, fonts } };
}
