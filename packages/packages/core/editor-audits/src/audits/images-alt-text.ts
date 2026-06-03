import { __ } from '@wordpress/i18n';

import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

export const descriptor: AuditDescriptor = {
	id: 'audits/images-alt-text',
	title: __( 'Images alt text', 'elementor' ),
	description: __( 'Every image needs a meaningful alt attribute for screen readers and image-search.', 'elementor' ),
	fixHint: __( "Open the image's settings and add an Alt Text describing the image.", 'elementor' ),
	categories: [ 'seo', 'accessibility' ],
	severity: 'error',
	weight: 10,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
	const violations: AuditViolation[] = [];

	walkElements( ctx.elements.tree, ( node ) => {
		if ( node.elType !== 'widget' || node.widgetType !== 'image' ) {
			return;
		}

		const image = node.settings.image as { alt?: string } | undefined;

		if ( ! image?.alt ) {
			violations.push( {
				auditId: descriptor.id,
				elementId: node.id,
				targetHint: 'element-settings',
				label: __( 'Image is missing alt text.', 'elementor' ),
			} );
		}
	} );

	return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
