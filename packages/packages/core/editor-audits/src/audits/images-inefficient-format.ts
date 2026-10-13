import { __ } from '@wordpress/i18n';

import { type Audit, type AuditViolation, type ElementSnapshotNode } from '../types';
import { walkAtomicBackgroundImageSources } from '../utils/atomic-background-image-sources';
import { walkAtomicImageSources } from '../utils/atomic-image-sources';
import { walkBackgroundImageSources } from '../utils/background-image-sources';
import { type ImageLikeMedia, walkImageLikeSources } from '../utils/image-like-sources';
import { buildImageSizeKey } from '../utils/image-size-key';

const LEGACY_RASTER_MIME_TYPES = new Set( [ 'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff' ] );

export const audit: Audit = {
	id: 'audits/images-inefficient-format',
	title: __( 'Inefficient image format', 'elementor' ),
	description: __( "Image isn't served in a modern, efficient format like WebP or AVIF.", 'elementor' ),
	fixHint: __( 'Convert the image to a modern format like WebP or AVIF, or enable image optimization.', 'elementor' ),
	categories: [ 'performance' ],
	severity: 'info',
	weight: 1,
	evaluate: ( ctx ) => {
		const isReady = ctx.pageContext.image_optimization_plugin_active;
		const offendingElementIds = new Set< string >();
		let hasAnyImage = false;
		let inefficientImageFormatCount = 0;

		const evaluateSource = ( node: ElementSnapshotNode, media: ImageLikeMedia ) => {
			if ( media.id || media.url ) {
				hasAnyImage = true;
			}

			const id = media.id;

			if ( ! id ) {
				return;
			}

			const mime = ctx.pageContext.image_sizes[ buildImageSizeKey( { id, size: media.size } ) ]?.mime;

			if ( ! mime || ! LEGACY_RASTER_MIME_TYPES.has( mime ) ) {
				return;
			}

			inefficientImageFormatCount++;
			offendingElementIds.add( node.id );
		};

		walkImageLikeSources( ctx.elements.tree, ( { node, media } ) => evaluateSource( node, media ) );
		walkBackgroundImageSources( ctx.elements.tree, ( { node, media } ) => evaluateSource( node, media ) );
		walkAtomicImageSources( ctx.elements.tree, ( { node, media } ) => evaluateSource( node, media ) );
		walkAtomicBackgroundImageSources( ctx.elements.tree, ( { node, media } ) => evaluateSource( node, media ) );

		if ( ! hasAnyImage ) {
			return { status: 'skipped', reason: __( 'No images', 'elementor' ) };
		}

		const violations: AuditViolation[] = Array.from( offendingElementIds ).map( ( elementId ) => ( {
			auditId: audit.id,
			elementId,
			targetHint: 'element-settings' as const,
			label: __( "Image isn't served in a modern format like WebP or AVIF.", 'elementor' ),
			externalUrl: isReady
				? ctx.pageContext.image_optimization_settings_url
				: ctx.pageContext.image_optimization_plugin_url,
			ctaLabel: __( 'Optimize all', 'elementor' ),
		} ) );

		return violations.length === 0
			? { status: 'pass' }
			: { status: 'fail', violations, metadata: { inefficientImageFormatCount } };
	},
};
