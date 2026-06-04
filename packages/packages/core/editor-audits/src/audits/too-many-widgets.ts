import { __ } from '@wordpress/i18n';

import { walkElements } from '../lib/walk';
import { type Audit } from '../types';

const WIDGET_COUNT_THRESHOLD = 100;

export const audit: Audit = {
	id: 'audits/too-many-widgets',
	title: __( 'Too many widgets', 'elementor' ),
	description: __( 'Excessive DOM size caused by too many widgets degrades rendering performance.', 'elementor' ),
	fixHint: __( 'Reduce the number of widgets on the page by removing or combining elements.', 'elementor' ),
	categories: [ 'best-practices', 'performance' ],
	severity: 'warning',
	weight: 5,
	evaluate: ( ctx ) => {
		let widgetCount = 0;

		walkElements( ctx.elements.tree, ( node ) => {
			if ( node.elType === 'widget' ) {
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
