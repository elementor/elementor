import { __, sprintf } from '@wordpress/i18n';

import { type Audit, type AuditViolation, type ElementSnapshotNode } from '../types';
import { walkAtomicBackgroundImageSources } from '../utils/atomic-background-image-sources';
import { walkAtomicImageSources } from '../utils/atomic-image-sources';
import { walkBackgroundImageSources } from '../utils/background-image-sources';
import { type ImageLikeMedia, walkImageLikeSources } from '../utils/image-like-sources';
import { buildImageSizeKey } from '../utils/image-size-key';

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
		let oversizedImageCount = 0;
		let hasAnyImage = false;

		const evaluateSource = ( node: ElementSnapshotNode, media: ImageLikeMedia ) => {
			if ( media.id || media.url ) {
				hasAnyImage = true;
			}

			const id = media.id;

			if ( ! id ) {
				return;
			}

			const size = ctx.pageContext.image_sizes[ buildImageSizeKey( { id, size: media.size } ) ];

			if ( ! size || size.filesize_bytes <= SIZE_THRESHOLD_BYTES ) {
				return;
			}

			oversizedImageCount++;

			const kb = Math.round( size.filesize_bytes / BYTES_PER_KB );
			const currentMax = widgetMaxKb.get( node.id ) ?? 0;
			widgetMaxKb.set( node.id, Math.max( currentMax, kb ) );
		};

		walkImageLikeSources( ctx.elements.tree, ( { node, media } ) => evaluateSource( node, media ) );
		walkBackgroundImageSources( ctx.elements.tree, ( { node, media } ) => evaluateSource( node, media ) );
		walkAtomicImageSources( ctx.elements.tree, ( { node, media } ) => evaluateSource( node, media ) );
		walkAtomicBackgroundImageSources( ctx.elements.tree, ( { node, media } ) => evaluateSource( node, media ) );

		if ( ! hasAnyImage ) {
			return { status: 'skipped', reason: __( 'No images', 'elementor' ) };
		}

		const violations: AuditViolation[] = Array.from( widgetMaxKb.entries() ).map( ( [ elementId, kb ] ) => ( {
			auditId: audit.id,
			elementId,
			targetHint: 'element-settings' as const,
			label: sprintf(
				/* translators: %d is the image file size in kilobytes. */
				__( 'Image is %d KB (over 500 KB).', 'elementor' ),
				kb
			),
			externalUrl: ctx.pageContext.image_optimization_plugin_url,
		} ) );

		return violations.length === 0
			? { status: 'pass' }
			: { status: 'fail', violations, metadata: { oversizedImageCount } };
	},
};
