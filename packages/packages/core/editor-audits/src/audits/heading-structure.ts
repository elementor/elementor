import { __ } from '@wordpress/i18n';

import { walkElements } from '../lib/walk';
import { type Audit, type AuditViolation } from '../types';

type HeadingControlDescriptor = {
	control: string;
	when?: Record< string, string | string[] >;
	requiresNonEmpty?: string;
	requiresAnyNonEmpty?: string[];
	repeat?: {
		items: string;
		textField?: string;
		itemWhen?: Record< string, string | string[] >;
		tagSource?: 'widget' | 'item';
	};
	dynamic?: true;
};

type HeadingControlsRegistry = Record< string, HeadingControlDescriptor[] >;

type PageHeading = {
	elementId: string;
	level: number;
};

type Settings = Record< string, unknown >;

const HEADING_LEVELS = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] as const;

const HEADING_CONTROLS_REGISTRY: HeadingControlsRegistry = {
	// Core
	heading: [ { control: 'header_size', requiresNonEmpty: 'title' } ],
	'e-heading': [ { control: 'tag', requiresNonEmpty: 'title' } ],
	'icon-box': [ { control: 'title_size', requiresNonEmpty: 'title_text' } ],
	'image-box': [ { control: 'title_size', requiresNonEmpty: 'title_text' } ],
	counter: [ { control: 'title_tag', requiresNonEmpty: 'title' } ],
	progress: [ { control: 'title_tag', when: { title_display: 'yes' }, requiresNonEmpty: 'title' } ],
	accordion: [ { control: 'title_html_tag', repeat: { items: 'tabs', textField: 'tab_title' } } ],
	toggle: [ { control: 'title_html_tag', repeat: { items: 'tabs', textField: 'tab_title' } } ],
	divider: [ { control: 'html_tag', when: { look: 'line_text' }, requiresNonEmpty: 'text' } ],
	'nested-accordion': [ { control: 'title_tag', repeat: { items: 'items', textField: 'item_title' } } ],
	'link-in-bio': [
		{ control: 'bio_heading_tag', requiresNonEmpty: 'bio_heading' },
		{ control: 'bio_title_tag', requiresNonEmpty: 'bio_title' },
		{ control: 'bio_about_tag', requiresNonEmpty: 'bio_about' },
	],
	// Pro — static / repeater
	'animated-headline': [
		{
			control: 'tag',
			requiresAnyNonEmpty: [ 'before_text', 'highlighted_text', 'rotating_text', 'after_text' ],
		},
	],
	'author-box': [ { control: 'author_name_tag', requiresNonEmpty: 'author_name' } ],
	'call-to-action': [
		{ control: 'title_tag', requiresNonEmpty: 'title' },
		{ control: 'description_tag', requiresNonEmpty: 'description' },
	],
	'flip-box': [
		{ control: 'title_tag', requiresNonEmpty: 'title_text_a' },
		{ control: 'description_tag', requiresNonEmpty: 'description_text_a' },
		{ control: 'title_tag', requiresNonEmpty: 'title_text_b' },
		{ control: 'description_tag', requiresNonEmpty: 'description_text_b' },
	],
	'price-list': [
		{ control: 'title_tag', repeat: { items: 'price_list', textField: 'title' } },
		{ control: 'description_tag', repeat: { items: 'price_list', textField: 'item_description' } },
	],
	'price-table': [ { control: 'heading_tag', requiresNonEmpty: 'heading' } ],
	slides: [
		{ control: 'slides_title_tag', repeat: { items: 'slides', textField: 'heading' } },
		{ control: 'slides_description_tag', repeat: { items: 'slides', textField: 'description' } },
	],
	'table-of-contents': [ { control: 'html_tag', requiresNonEmpty: 'title' } ],
	'video-playlist': [
		{ control: 'playlist_title_tag', requiresNonEmpty: 'playlist_title' },
		{
			control: 'section_html_tag',
			repeat: { items: 'tabs', tagSource: 'item', itemWhen: { type: 'section' }, textField: 'title' },
		},
		{
			control: 'video_html_tag',
			repeat: {
				items: 'tabs',
				tagSource: 'item',
				itemWhen: { type: [ 'youtube', 'vimeo', 'hosted' ] },
				textField: 'title',
			},
		},
	],
	sitemap: [ { control: 'sitemap_title_tag', repeat: { items: 'sitemap_items', textField: 'sitemap_title' } } ],
	'loop-grid': [
		{
			control: 'nothing_found_message_html_tag',
			when: { enable_nothing_found_message: 'yes' },
			requiresNonEmpty: 'nothing_found_message_text',
		},
	],
	search: [
		{
			control: 'nothing_found_message_html_tag',
			when: { enable_nothing_found_message: 'yes' },
			requiresNonEmpty: 'nothing_found_message_text',
		},
	],
	// Pro — dynamic (single placeholder per widget)
	posts: [ { control: 'title_tag', when: { show_title: 'yes' }, dynamic: true } ],
	'archive-posts': [ { control: 'title_tag', when: { show_title: 'yes' }, dynamic: true } ],
	portfolio: [ { control: 'title_tag', when: { show_title: 'yes' }, dynamic: true } ],
	// Pro — theme / Woo
	'theme-post-title': [ { control: 'header_size', dynamic: true } ],
	'theme-page-title': [ { control: 'header_size', dynamic: true } ],
	'theme-archive-title': [ { control: 'header_size', dynamic: true } ],
	'theme-site-title': [ { control: 'header_size', dynamic: true } ],
	'woocommerce-product-title': [ { control: 'header_size', dynamic: true } ],
};

function isNonEmptyString( value: unknown ): boolean {
	return typeof value === 'string' && value.trim() !== '';
}

function matchesWhen( settings: Settings, when?: Record< string, string | string[] > ): boolean {
	if ( ! when ) {
		return true;
	}

	return Object.entries( when ).every( ( [ key, expected ] ) => {
		const actual = settings[ key ];

		if ( Array.isArray( expected ) ) {
			return expected.includes( String( actual ) );
		}

		return String( actual ) === expected;
	} );
}

function hasRequiredText( settings: Settings, key?: string ): boolean {
	if ( ! key ) {
		return true;
	}

	return isNonEmptyString( settings[ key ] );
}

function hasAnyRequiredText( settings: Settings, keys?: string[] ): boolean {
	if ( ! keys?.length ) {
		return true;
	}

	return keys.some( ( key ) => isNonEmptyString( settings[ key ] ) );
}

function parseHeadingLevel( raw: unknown ): number | null {
	if ( typeof raw !== 'string' ) {
		return null;
	}

	const idx = HEADING_LEVELS.indexOf( raw.toLowerCase() as ( typeof HEADING_LEVELS )[ number ] );

	return idx >= 0 ? idx + 1 : null;
}

function getRepeaterRows( settings: Settings, key: string ): Settings[] {
	const rows = settings[ key ];

	return Array.isArray( rows ) ? ( rows as Settings[] ) : [];
}

function pushHeading( headings: PageHeading[], elementId: string, raw: unknown ): void {
	const level = parseHeadingLevel( raw );

	if ( level !== null ) {
		headings.push( { elementId, level } );
	}
}

function extractHeadingsFromWidget( elementId: string, widgetType: string, settings: Settings ): PageHeading[] {
	const descriptors = HEADING_CONTROLS_REGISTRY[ widgetType ];

	if ( ! descriptors ) {
		return [];
	}

	const headings: PageHeading[] = [];

	for ( const descriptor of descriptors ) {
		if ( ! matchesWhen( settings, descriptor.when ) ) {
			continue;
		}

		if ( ! hasRequiredText( settings, descriptor.requiresNonEmpty ) ) {
			continue;
		}

		if ( ! hasAnyRequiredText( settings, descriptor.requiresAnyNonEmpty ) ) {
			continue;
		}

		if ( descriptor.repeat ) {
			const { items, textField, itemWhen, tagSource = 'widget' } = descriptor.repeat;

			for ( const row of getRepeaterRows( settings, items ) ) {
				if ( ! matchesWhen( row, itemWhen ) ) {
					continue;
				}

				if ( textField && ! hasRequiredText( row, textField ) ) {
					continue;
				}

				const raw = tagSource === 'item' ? row[ descriptor.control ] : settings[ descriptor.control ];

				pushHeading( headings, elementId, raw );

				if ( descriptor.dynamic ) {
					break;
				}
			}
		} else {
			pushHeading( headings, elementId, settings[ descriptor.control ] );
		}
	}

	return headings;
}

function extractPageHeadings( tree: Parameters< typeof walkElements >[ 0 ] ): PageHeading[] {
	const headings: PageHeading[] = [];

	walkElements( tree, ( node ) => {
		if ( node.elType !== 'widget' || ! node.widgetType ) {
			return;
		}

		headings.push( ...extractHeadingsFromWidget( node.id, node.widgetType, node.settings ) );
	} );

	return headings;
}

export const audit: Audit = {
	id: 'audits/heading-structure',
	title: __( 'Heading structure', 'elementor' ),
	description: __( 'Pages should have exactly one H1 and a non-skipping heading order.', 'elementor' ),
	fixHint: __( 'Ensure your page has one H1 and that heading levels do not skip (no H2 → H4).', 'elementor' ),
	categories: [ 'seo', 'accessibility' ],
	severity: 'error',
	weight: 10,
	evaluate: ( ctx ) => {
		if ( ctx.elements.tree.length === 0 ) {
			return { status: 'skipped', reason: __( 'No elements', 'elementor' ) };
		}

		const headings = extractPageHeadings( ctx.elements.tree );

		const violations: AuditViolation[] = [];

		if ( headings.length === 0 ) {
			violations.push( {
				auditId: audit.id,
				label: __( 'No headings found on the page.', 'elementor' ),
			} );
		} else {
			const h1Count = headings.filter( ( h ) => h.level === 1 ).length;

			if ( h1Count === 0 ) {
				violations.push( { auditId: audit.id, label: __( 'No H1 on the page.', 'elementor' ) } );
			}

			if ( h1Count > 1 ) {
				headings
					.filter( ( h ) => h.level === 1 )
					.slice( 1 )
					.forEach( ( h ) =>
						violations.push( {
							auditId: audit.id,
							elementId: h.elementId,
							targetHint: 'element-settings',
							label: __( 'More than one H1 on the page.', 'elementor' ),
						} )
					);
			}

			for ( let i = 1; i < headings.length; i++ ) {
				if ( headings[ i ].level - headings[ i - 1 ].level > 1 ) {
					violations.push( {
						auditId: audit.id,
						elementId: headings[ i ].elementId,
						targetHint: 'element-settings',
						label: __( 'Heading level skipped.', 'elementor' ),
					} );
				}
			}
		}

		return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
	},
};
