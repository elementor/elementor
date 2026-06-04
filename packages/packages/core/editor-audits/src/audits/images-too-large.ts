import { __, sprintf } from '@wordpress/i18n';

import { walkImageLikeSources } from '../lib/image-like-sources';
import { type Audit, type AuditViolation } from '../types';

const SIZE_THRESHOLD_BYTES = 500 * 1024;
const BYTES_PER_KB = 1024;

export const audit: Audit = {
	id: 'audits/images-too-large',
	title: __( 'Oversized images', 'elementor' ),
	description: __( 'Large image files slow down the page.', 'elementor' ),
	fixHint: __( 'Replace the image with a smaller version or enable image optimization.', 'elementor' ),
	categories: [ 'performance' ],
	severity: 'warning',
	weight: 7,
	evaluate: ( ctx ) => {
		const widgetMaxKb = new Map< string, number >();

		walkImageLikeSources( ctx.elements.tree, ( { node, media } ) => {
			const id = media.id;

			if ( ! id ) {
				return;
			}

			const size = ctx.pageContext.image_sizes[ id ];

			if ( ! size || size.filesize_bytes <= SIZE_THRESHOLD_BYTES ) {
				return;
			}

			const kb = Math.round( size.filesize_bytes / BYTES_PER_KB );
			const currentMax = widgetMaxKb.get( node.id ) ?? 0;
			widgetMaxKb.set( node.id, Math.max( currentMax, kb ) );
		} );

		const violations: AuditViolation[] = Array.from( widgetMaxKb.entries() ).map( ( [ elementId, kb ] ) => ( {
			auditId: audit.id,
			elementId,
			targetHint: 'element-settings' as const,
			label: sprintf(
				/* translators: %d is the image file size in kilobytes. */
				__( 'Image is %d KB (over 500 KB).', 'elementor' ),
				kb
			),
		} ) );

		return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
	},
};
