import { __ } from '@wordpress/i18n';

import { type Audit, type AuditViolation } from '../types';
import { hasMeaningfulAlt, isImageSourcePresent } from '../utils/image-alt';
import { hasPageImages, walkImageLikeSources } from '../utils/image-like-sources';

export const audit: Audit = {
	id: 'audits/images-alt-text',
	title: __( 'Images alt text', 'elementor' ),
	description: __( 'Every image needs a meaningful alt attribute for screen readers and image-search.', 'elementor' ),
	fixHint: __( "Open the image's settings and add an Alt Text describing the image.", 'elementor' ),
	categories: [ 'seo', 'accessibility' ],
	severity: 'error',
	weight: 10,
	evaluate: ( ctx ) => {
		if ( ! hasPageImages( ctx.elements.tree ) ) {
			return { status: 'skipped', reason: __( 'No images', 'elementor' ) };
		}

		const violations: AuditViolation[] = [];
		const failedWidgetIds = new Set< string >();
		let missingAltImageCount = 0;

		walkImageLikeSources( ctx.elements.tree, ( { node, media } ) => {
			if ( ! isImageSourcePresent( media ) || hasMeaningfulAlt( media, ctx.pageContext ) ) {
				return;
			}

			missingAltImageCount++;

			if ( ! failedWidgetIds.has( node.id ) ) {
				failedWidgetIds.add( node.id );
				violations.push( {
					auditId: audit.id,
					elementId: node.id,
					targetHint: 'element-settings',
					label: __( 'One or more images are missing alt text.', 'elementor' ),
					externalUrl: ctx.pageContext.ally_plugin_url,
				} );
			}
		} );

		return violations.length === 0
			? { status: 'pass' }
			: { status: 'fail', violations, metadata: { missingAltImageCount } };
	},
};
