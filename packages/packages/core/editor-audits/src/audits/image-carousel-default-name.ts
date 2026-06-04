import { __ } from '@wordpress/i18n';

import { walkElements } from '../lib/walk';
import { type Audit, type AuditViolation } from '../types';

const DEFAULT_NAME = 'image carousel';

export const audit: Audit = {
	id: 'audits/image-carousel-default-name',
	title: __( 'Image carousel uses its default accessible name', 'elementor' ),
	description: __( 'A generic name like "Image Carousel" is not descriptive for screen readers.', 'elementor' ),
	fixHint: __( 'Set a meaningful accessible name based on the carousel content.', 'elementor' ),
	categories: [ 'accessibility', 'seo' ],
	severity: 'warning',
	weight: 5,
	evaluate: ( ctx ) => {
		const violations: AuditViolation[] = [];

		walkElements( ctx.elements.tree, ( node ) => {
			if ( node.elType !== 'widget' || node.widgetType !== 'image-carousel' ) {
				return;
			}

			const name = ( node.settings.accessible_name ?? node.settings._aria_label ?? '' ) as string;

			if ( ! name || name.trim().toLowerCase() === DEFAULT_NAME ) {
				violations.push( {
					auditId: audit.id,
					elementId: node.id,
					targetHint: 'element-settings',
					label: __( 'Image carousel uses the default name.', 'elementor' ),
				} );
			}
		} );

		return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
	},
};
