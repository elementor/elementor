import { __ } from '@wordpress/i18n';

import { walkElements } from '../lib/walk';
import { type Audit, type AuditViolation } from '../types';

const HEADING_WIDGETS = new Set( [ 'heading', 'text-editor-heading' ] );
const LEVELS = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] as const;

export const audit: Audit = {
	id: 'audits/heading-structure',
	title: __( 'Heading structure', 'elementor' ),
	description: __( 'Pages should have exactly one H1 and a non-skipping heading order.', 'elementor' ),
	fixHint: __( 'Ensure your page has one H1 and that heading levels do not skip (no H2 → H4).', 'elementor' ),
	categories: [ 'seo', 'accessibility' ],
	severity: 'error',
	weight: 10,
	evaluate: ( ctx ) => {
		if ( ctx.elements.tree.length === 0 ) {
			return { status: 'skipped', reason: __( 'No elements', 'elementor' ) };
		}

		const headings: Array< { id: string; level: number } > = [];

		walkElements( ctx.elements.tree, ( node ) => {
			if ( node.elType !== 'widget' || ! HEADING_WIDGETS.has( node.widgetType ?? '' ) ) {
				return;
			}

			const raw = ( node.settings.header_size ?? node.settings.level ?? 'h2' ) as string;
			const idx = LEVELS.indexOf( raw.toLowerCase() as ( typeof LEVELS )[ number ] );

			if ( idx >= 0 ) {
				headings.push( { id: node.id, level: idx + 1 } );
			}
		} );

		const violations: AuditViolation[] = [];

		if ( headings.length === 0 ) {
			violations.push( {
				auditId: audit.id,
				label: __( 'No headings found on the page.', 'elementor' ),
			} );
		} else {
			const h1Count = headings.filter( ( h ) => h.level === 1 ).length;

			if ( h1Count === 0 ) {
				violations.push( { auditId: audit.id, label: __( 'No H1 on the page.', 'elementor' ) } );
			}

			if ( h1Count > 1 ) {
				headings
					.filter( ( h ) => h.level === 1 )
					.slice( 1 )
					.forEach( ( h ) =>
						violations.push( {
							auditId: audit.id,
							elementId: h.id,
							targetHint: 'element-settings',
							label: __( 'Extra H1 — only one H1 per page.', 'elementor' ),
						} )
					);
			}

			for ( let i = 1; i < headings.length; i++ ) {
				if ( headings[ i ].level - headings[ i - 1 ].level > 1 ) {
					violations.push( {
						auditId: audit.id,
						elementId: headings[ i ].id,
						targetHint: 'element-settings',
						label: __( 'Heading level skipped.', 'elementor' ),
					} );
				}
			}
		}

		return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
	},
};
