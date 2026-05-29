import { __, sprintf } from '@wordpress/i18n';

import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

const SIZE_THRESHOLD_BYTES = 500 * 1024;
const BYTES_PER_KB = 1024;

export const descriptor: AuditDescriptor = {
	id: 'audits/images-too-large',
	title: __( 'Oversized images', 'elementor' ),
	description: __( 'Large image files slow down the page.', 'elementor' ),
	fixHint: __( 'Replace the image with a smaller version or enable image optimization.', 'elementor' ),
	categories: [ 'performance' ],
	severity: 'warning',
	weight: 7,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
	const violations: AuditViolation[] = [];

	walkElements( ctx.elements.tree, ( node ) => {
		if ( node.elType !== 'widget' || node.widgetType !== 'image' ) {
			return;
		}

		const image = node.settings.image as { id?: number } | undefined;
		const id = image?.id;

		if ( ! id ) {
			return;
		}

		const size = ctx.pageContext.image_sizes[ id ];

		if ( size && size.filesize_bytes > SIZE_THRESHOLD_BYTES ) {
			violations.push( {
				auditId: descriptor.id,
				elementId: node.id,
				targetHint: 'element-settings',
				label: sprintf(
					/* translators: %d is the image file size in kilobytes. */
					__( 'Image is %d KB (over 500 KB).', 'elementor' ),
					Math.round( size.filesize_bytes / BYTES_PER_KB )
				),
			} );
		}
	} );

	return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
