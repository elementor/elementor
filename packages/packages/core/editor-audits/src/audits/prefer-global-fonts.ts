import { __, sprintf } from '@wordpress/i18n';

import { collectHardcodedFonts } from '../lib/collect-hardcoded-fonts';
import { findMatchingGlobalFont } from '../lib/match-global-font';
import { walkElements } from '../lib/walk';
import { type Audit, type AuditViolation } from '../types';

export const audit: Audit = {
	id: 'audits/prefer-global-fonts',
	title: __( 'Prefer global fonts', 'elementor' ),
	description: __( 'Global fonts make the design consistent and easy to update site-wide.', 'elementor' ),
	fixHint: __( 'Replace the hard-coded value with the matching global font.', 'elementor' ),
	categories: [ 'best-practices', 'performance' ],
	severity: 'info',
	weight: 3,
	evaluate: ( ctx ) => {
		if ( ctx.elements.tree.length === 0 ) {
			return { status: 'skipped', reason: __( 'No elements', 'elementor' ) };
		}

		if ( ctx.kit.globals.fonts.length === 0 ) {
			return { status: 'skipped', reason: __( 'No global fonts', 'elementor' ) };
		}

		const violations: AuditViolation[] = [];

		walkElements( ctx.elements.tree, ( node ) => {
			for ( const { value } of collectHardcodedFonts( node.settings ) ) {
				const global = findMatchingGlobalFont( value, ctx.kit.globals.fonts );

				if ( ! global ) {
					continue;
				}

				violations.push( {
					auditId: audit.id,
					elementId: node.id,
					targetHint: 'element-settings',
					label: sprintf(
						/* translators: %s: global font title. */
						__( 'replace hardcoded typography with "%s" global font', 'elementor' ),
						global.title
					),
				} );
			}
		} );

		return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
	},
};
