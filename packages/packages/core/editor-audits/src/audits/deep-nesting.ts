import { getWidgetsCache } from '@elementor/editor-elements';
import { __ } from '@wordpress/i18n';

import { type Audit, type AuditViolation, type ElementSnapshotNode } from '../types';
import { walkElements } from '../utils/walk';

const MAX_NESTING_DEPTH = 6;

function isNestingElement( node: ElementSnapshotNode, widgetsCache: ReturnType< typeof getWidgetsCache > ): boolean {
	if ( node.elType === 'container' ) {
		return true;
	}

	return !! widgetsCache?.[ node.elType ]?.meta?.is_container;
}

export const audit: Audit = {
	id: 'audits/deep-nesting',
	title: __( 'Deep container nesting', 'elementor' ),
	description: __(
		'Container nesting exceeds the recommended depth. Deep DOM trees hurt rendering performance and readability.',
		'elementor'
	),
	fixHint: __( 'Flatten the layout by removing unnecessary wrapper containers.', 'elementor' ),
	categories: [ 'performance', 'best-practices' ],
	severity: 'warning',
	weight: 5,
	evaluate: ( ctx ) => {
		if ( ctx.elements.tree.length === 0 ) {
			return { status: 'skipped', reason: __( 'No elements', 'elementor' ) };
		}

		const widgetsCache = getWidgetsCache();
		const violations: AuditViolation[] = [];

		walkElements( ctx.elements.tree, ( node, parents ) => {
			if ( ! isNestingElement( node, widgetsCache ) ) {
				return;
			}

			const depth = parents.filter( ( parent ) => isNestingElement( parent, widgetsCache ) ).length + 1;

			if ( depth > MAX_NESTING_DEPTH ) {
				violations.push( {
					auditId: audit.id,
					elementId: node.id,
					targetHint: 'element-settings',
					label: __( 'Container nesting is too deep.', 'elementor' ),
				} );
			}
		} );

		return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
	},
};
