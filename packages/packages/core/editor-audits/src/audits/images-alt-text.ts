import { __ } from '@wordpress/i18n';

import { hasMeaningfulAlt, isImageSourcePresent } from '../lib/image-alt';
import { walkImageLikeSources } from '../lib/image-like-sources';
import { type Audit, type AuditViolation } from '../types';

export const audit: Audit = {
	id: 'audits/images-alt-text',
	title: __( 'Images alt text', 'elementor' ),
	description: __( 'Every image needs a meaningful alt attribute for screen readers and image-search.', 'elementor' ),
	fixHint: __( "Open the image's settings and add an Alt Text describing the image.", 'elementor' ),
	categories: [ 'seo', 'accessibility' ],
	severity: 'error',
	weight: 10,
	evaluate: ( ctx ) => {
		const violations: AuditViolation[] = [];
		const failedWidgetIds = new Set< string >();

		walkImageLikeSources( ctx.elements.tree, ( { node, media } ) => {
			if ( ! isImageSourcePresent( media ) || hasMeaningfulAlt( media, ctx.pageContext ) ) {
				return;
			}

			if ( ! failedWidgetIds.has( node.id ) ) {
				failedWidgetIds.add( node.id );
				violations.push( {
					auditId: audit.id,
					elementId: node.id,
					targetHint: 'element-settings',
					label: __( 'One or more images are missing alt text.', 'elementor' ),
				} );
			}
		} );

		return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
	},
};
