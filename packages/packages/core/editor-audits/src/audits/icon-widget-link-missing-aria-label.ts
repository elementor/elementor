import { __ } from '@wordpress/i18n';

import { walkElements } from '../lib/walk';
import { type Audit, type AuditViolation } from '../types';

function customAttributesHaveAria( attributes: unknown ): boolean {
	if ( typeof attributes !== 'string' || attributes.trim() === '' ) {
		return false;
	}

	return attributes
		.split( ',' )
		.map( ( pair ) => pair.split( '|' )[ 0 ]?.trim().toLowerCase() )
		.some( ( key ) => key === 'aria-label' || key === 'aria-labelledby' );
}

export const audit: Audit = {
	id: 'audits/icon-widget-link-missing-aria-label',
	title: __( 'Icon link missing aria-label', 'elementor' ),
	description: __(
		'Icon-only links need an aria-label so screen readers can announce the link target.',
		'elementor'
	),
	fixHint: __(
		"Add an aria-label custom attribute to the icon widget describing the link's destination.",
		'elementor'
	),
	categories: [ 'accessibility' ],
	severity: 'warning',
	weight: 5,
	evaluate: ( ctx ) => {
		const violations: AuditViolation[] = [];

		walkElements( ctx.elements.tree, ( node ) => {
			if ( node.elType !== 'widget' || node.widgetType !== 'icon' ) {
				return;
			}

			const link = node.settings.link as { url?: string } | undefined;

			if ( ! link?.url ) {
				return;
			}

			if ( ! customAttributesHaveAria( node.settings.custom_attributes ?? node.settings._attributes ) ) {
				violations.push( {
					auditId: audit.id,
					elementId: node.id,
					targetHint: 'element-settings',
					label: __( 'Icon link is missing aria-label.', 'elementor' ),
				} );
			}
		} );

		return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
	},
};
