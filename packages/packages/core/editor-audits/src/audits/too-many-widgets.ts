import { getWidgetsCache } from '@elementor/editor-elements';
import { __ } from '@wordpress/i18n';

import { type Audit, type ElementSnapshotNode } from '../types';
import { walkElements } from '../utils/walk';

const WIDGET_COUNT_THRESHOLD = 100;

function isCountableWidget( node: ElementSnapshotNode, widgetsCache: ReturnType< typeof getWidgetsCache > ): boolean {
	if ( node.elType === 'widget' ) {
		return true;
	}

	return !! widgetsCache?.[ node.elType ]?.meta?.is_compound;
}

export const audit: Audit = {
	id: 'audits/too-many-widgets',
	title: __( 'Too many widgets', 'elementor' ),
	description: __( 'Excessive DOM size caused by too many widgets degrades rendering performance.', 'elementor' ),
	fixHint: __( 'Reduce the number of widgets on the page by removing or combining elements.', 'elementor' ),
	categories: [ 'best-practices', 'performance' ],
	severity: 'warning',
	weight: 5,
	evaluate: ( ctx ) => {
		if ( ctx.elements.tree.length === 0 ) {
			return { status: 'skipped', reason: __( 'No elements', 'elementor' ) };
		}

		const widgetsCache = getWidgetsCache();
		let widgetCount = 0;

		walkElements( ctx.elements.tree, ( node ) => {
			if ( isCountableWidget( node, widgetsCache ) ) {
				widgetCount++;
			}
		} );

		if ( widgetCount <= WIDGET_COUNT_THRESHOLD ) {
			return { status: 'pass' };
		}

		return {
			status: 'fail',
			violations: [
				{
					auditId: audit.id,
					label: __( 'Page has too many widgets.', 'elementor' ),
				},
			],
		};
	},
};
