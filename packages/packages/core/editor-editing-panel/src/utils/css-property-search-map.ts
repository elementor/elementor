import { __ } from '@wordpress/i18n';

export type CSSPropertyMapping = {
	property: string;
	section: string;
	sectionTitle: string;
	displayName: string;
	keywords: string[];
};

export type SectionInfo = {
	name: string;
	title: string;
	properties: string[];
};

/**
 * Complete mapping of CSS properties to their sections and metadata
 * Extracted from StyleTabSection fields in style-tab.tsx
 */
export const CSS_PROPERTY_MAPPINGS: CSSPropertyMapping[] = [
	// Layout Section
	{
		property: 'display',
		section: 'Layout',
		sectionTitle: __( 'Layout', 'elementor' ),
		displayName: __( 'Display', 'elementor' ),
		keywords: [ 'display', 'block', 'flex', 'inline', 'layout' ],
	},
	{
		property: 'flex-direction',
		section: 'Layout',
		sectionTitle: __( 'Layout', 'elementor' ),
		displayName: __( 'Flex Direction', 'elementor' ),
		keywords: [ 'flex', 'direction', 'row', 'column', 'layout' ],
	},
	{
		property: 'flex-wrap',
		section: 'Layout',
		sectionTitle: __( 'Layout', 'elementor' ),
		displayName: __( 'Flex Wrap', 'elementor' ),
		keywords: [ 'flex', 'wrap', 'nowrap', 'layout' ],
	},
	{
		property: 'justify-content',
		section: 'Layout',
		sectionTitle: __( 'Layout', 'elementor' ),
		displayName: __( 'Justify Content', 'elementor' ),
		keywords: [ 'justify', 'content', 'flex', 'alignment', 'center', 'start', 'end' ],
	},
	{
		property: 'align-items',
		section: 'Layout',
		sectionTitle: __( 'Layout', 'elementor' ),
		displayName: __( 'Align Items', 'elementor' ),
		keywords: [ 'align', 'items', 'flex', 'alignment', 'center', 'start', 'end' ],
	},
	{
		property: 'align-content',
		section: 'Layout',
		sectionTitle: __( 'Layout', 'elementor' ),
		displayName: __( 'Align Content', 'elementor' ),
		keywords: [ 'align', 'content', 'flex', 'alignment' ],
	},
	{
		property: 'align-self',
		section: 'Layout',
		sectionTitle: __( 'Layout', 'elementor' ),
		displayName: __( 'Align Self', 'elementor' ),
		keywords: [ 'align', 'self', 'flex', 'alignment' ],
	},
	{
		property: 'gap',
		section: 'Layout',
		sectionTitle: __( 'Layout', 'elementor' ),
		displayName: __( 'Gap', 'elementor' ),
		keywords: [ 'gap', 'spacing', 'flex', 'grid' ],
	},

	// Spacing Section
	{
		property: 'margin',
		section: 'Spacing',
		sectionTitle: __( 'Spacing', 'elementor' ),
		displayName: __( 'Margin', 'elementor' ),
		keywords: [ 'margin', 'spacing', 'outer', 'space' ],
	},
	{
		property: 'padding',
		section: 'Spacing',
		sectionTitle: __( 'Spacing', 'elementor' ),
		displayName: __( 'Padding', 'elementor' ),
		keywords: [ 'padding', 'spacing', 'inner', 'space' ],
	},

	// Size Section
	{
		property: 'width',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Width', 'elementor' ),
		keywords: [ 'width', 'size', 'dimension' ],
	},
	{
		property: 'min-width',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Min Width', 'elementor' ),
		keywords: [ 'min', 'width', 'minimum', 'size' ],
	},
	{
		property: 'max-width',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Max Width', 'elementor' ),
		keywords: [ 'max', 'width', 'maximum', 'size' ],
	},
	{
		property: 'height',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Height', 'elementor' ),
		keywords: [ 'height', 'size', 'dimension' ],
	},
	{
		property: 'min-height',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Min Height', 'elementor' ),
		keywords: [ 'min', 'height', 'minimum', 'size' ],
	},
	{
		property: 'max-height',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Max Height', 'elementor' ),
		keywords: [ 'max', 'height', 'maximum', 'size' ],
	},
	{
		property: 'overflow',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Overflow', 'elementor' ),
		keywords: [ 'overflow', 'hidden', 'scroll', 'visible' ],
	},
	{
		property: 'aspect-ratio',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Aspect Ratio', 'elementor' ),
		keywords: [ 'aspect', 'ratio', 'proportion', 'size' ],
	},
	{
		property: 'object-fit',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Object Fit', 'elementor' ),
		keywords: [ 'object', 'fit', 'cover', 'contain', 'image' ],
	},

	// Position Section
	{
		property: 'position',
		section: 'Position',
		sectionTitle: __( 'Position', 'elementor' ),
		displayName: __( 'Position', 'elementor' ),
		keywords: [ 'position', 'relative', 'absolute', 'fixed', 'sticky' ],
	},
	{
		property: 'z-index',
		section: 'Position',
		sectionTitle: __( 'Position', 'elementor' ),
		displayName: __( 'Z-Index', 'elementor' ),
		keywords: [ 'z-index', 'layer', 'stacking', 'order' ],
	},
	{
		property: 'scroll-margin-top',
		section: 'Position',
		sectionTitle: __( 'Position', 'elementor' ),
		displayName: __( 'Scroll Margin Top', 'elementor' ),
		keywords: [ 'scroll', 'margin', 'anchor', 'offset' ],
	},

	// Typography Section
	{
		property: 'font-family',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Font Family', 'elementor' ),
		keywords: [ 'font', 'family', 'typeface', 'text' ],
	},
	{
		property: 'font-weight',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Font Weight', 'elementor' ),
		keywords: [ 'font', 'weight', 'bold', 'thin', 'text' ],
	},
	{
		property: 'font-size',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Font Size', 'elementor' ),
		keywords: [ 'font', 'size', 'text', 'typography' ],
	},
	{
		property: 'text-align',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Text Align', 'elementor' ),
		keywords: [ 'text', 'align', 'alignment', 'center', 'left', 'right' ],
	},
	{
		property: 'color',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Color', 'elementor' ),
		keywords: [ 'color', 'text', 'font' ],
	},
	{
		property: 'line-height',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Line Height', 'elementor' ),
		keywords: [ 'line', 'height', 'spacing', 'text' ],
	},
	{
		property: 'letter-spacing',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Letter Spacing', 'elementor' ),
		keywords: [ 'letter', 'spacing', 'text', 'kerning' ],
	},
	{
		property: 'word-spacing',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Word Spacing', 'elementor' ),
		keywords: [ 'word', 'spacing', 'text' ],
	},
	{
		property: 'column-count',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Column Count', 'elementor' ),
		keywords: [ 'column', 'count', 'multi', 'text' ],
	},
	{
		property: 'text-decoration',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Text Decoration', 'elementor' ),
		keywords: [ 'text', 'decoration', 'underline', 'strikethrough' ],
	},
	{
		property: 'text-transform',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Text Transform', 'elementor' ),
		keywords: [ 'text', 'transform', 'uppercase', 'lowercase', 'capitalize' ],
	},
	{
		property: 'direction',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Direction', 'elementor' ),
		keywords: [ 'direction', 'rtl', 'ltr', 'text' ],
	},
	{
		property: 'font-style',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Font Style', 'elementor' ),
		keywords: [ 'font', 'style', 'italic', 'normal' ],
	},
	{
		property: 'stroke',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Stroke', 'elementor' ),
		keywords: [ 'stroke', 'text', 'outline' ],
	},

	// Background Section
	{
		property: 'background',
		section: 'Background',
		sectionTitle: __( 'Background', 'elementor' ),
		displayName: __( 'Background', 'elementor' ),
		keywords: [ 'background', 'bg', 'color', 'image', 'gradient' ],
	},

	// Border Section
	{
		property: 'border-radius',
		section: 'Border',
		sectionTitle: __( 'Border', 'elementor' ),
		displayName: __( 'Border Radius', 'elementor' ),
		keywords: [ 'border', 'radius', 'rounded', 'corner' ],
	},
	{
		property: 'border-width',
		section: 'Border',
		sectionTitle: __( 'Border', 'elementor' ),
		displayName: __( 'Border Width', 'elementor' ),
		keywords: [ 'border', 'width', 'thickness' ],
	},
	{
		property: 'border-color',
		section: 'Border',
		sectionTitle: __( 'Border', 'elementor' ),
		displayName: __( 'Border Color', 'elementor' ),
		keywords: [ 'border', 'color' ],
	},
	{
		property: 'border-style',
		section: 'Border',
		sectionTitle: __( 'Border', 'elementor' ),
		displayName: __( 'Border Style', 'elementor' ),
		keywords: [ 'border', 'style', 'solid', 'dashed', 'dotted' ],
	},

	// Effects Section
	{
		property: 'box-shadow',
		section: 'Effects',
		sectionTitle: __( 'Effects', 'elementor' ),
		displayName: __( 'Box Shadow', 'elementor' ),
		keywords: [ 'box', 'shadow', 'drop', 'effect' ],
	},
	{
		property: 'opacity',
		section: 'Effects',
		sectionTitle: __( 'Effects', 'elementor' ),
		displayName: __( 'Opacity', 'elementor' ),
		keywords: [ 'opacity', 'transparency', 'alpha', 'effect' ],
	},
	{
		property: 'transform',
		section: 'Effects',
		sectionTitle: __( 'Effects', 'elementor' ),
		displayName: __( 'Transform', 'elementor' ),
		keywords: [ 'transform', 'rotate', 'scale', 'translate', 'effect' ],
	},
	{
		property: 'filter',
		section: 'Effects',
		sectionTitle: __( 'Effects', 'elementor' ),
		displayName: __( 'Filter', 'elementor' ),
		keywords: [ 'filter', 'blur', 'brightness', 'contrast', 'effect' ],
	},
	{
		property: 'backdrop-filter',
		section: 'Effects',
		sectionTitle: __( 'Effects', 'elementor' ),
		displayName: __( 'Backdrop Filter', 'elementor' ),
		keywords: [ 'backdrop', 'filter', 'blur', 'effect' ],
	},
	{
		property: 'transform-origin',
		section: 'Effects',
		sectionTitle: __( 'Effects', 'elementor' ),
		displayName: __( 'Transform Origin', 'elementor' ),
		keywords: [ 'transform', 'origin', 'center', 'effect' ],
	},
	{
		property: 'transition',
		section: 'Effects',
		sectionTitle: __( 'Effects', 'elementor' ),
		displayName: __( 'Transition', 'elementor' ),
		keywords: [ 'transition', 'animation', 'duration', 'effect' ],
	},
];

/**
 * Get section information by section name
 */
export const SECTIONS_INFO: SectionInfo[] = [
	{
		name: 'Layout',
		title: __( 'Layout', 'elementor' ),
		properties: [
			'display',
			'flex-direction',
			'flex-wrap',
			'justify-content',
			'align-items',
			'align-content',
			'align-self',
			'gap',
		],
	},
	{
		name: 'Spacing',
		title: __( 'Spacing', 'elementor' ),
		properties: [ 'margin', 'padding' ],
	},
	{
		name: 'Size',
		title: __( 'Size', 'elementor' ),
		properties: [
			'width',
			'min-width',
			'max-width',
			'height',
			'min-height',
			'max-height',
			'overflow',
			'aspect-ratio',
			'object-fit',
		],
	},
	{
		name: 'Position',
		title: __( 'Position', 'elementor' ),
		properties: [ 'position', 'z-index', 'scroll-margin-top' ],
	},
	{
		name: 'Typography',
		title: __( 'Typography', 'elementor' ),
		properties: [
			'font-family',
			'font-weight',
			'font-size',
			'text-align',
			'color',
			'line-height',
			'letter-spacing',
			'word-spacing',
			'column-count',
			'text-decoration',
			'text-transform',
			'direction',
			'font-style',
			'stroke',
		],
	},
	{
		name: 'Background',
		title: __( 'Background', 'elementor' ),
		properties: [ 'background' ],
	},
	{
		name: 'Border',
		title: __( 'Border', 'elementor' ),
		properties: [ 'border-radius', 'border-width', 'border-color', 'border-style' ],
	},
	{
		name: 'Effects',
		title: __( 'Effects', 'elementor' ),
		properties: [
			'box-shadow',
			'opacity',
			'transform',
			'filter',
			'backdrop-filter',
			'transform-origin',
			'transition',
		],
	},
];

/**
 * Search CSS properties by query string
 * @param query
 */
export function searchCSSProperties( query: string ): CSSPropertyMapping[] {
	if ( ! query || query.length < 2 ) {
		return [];
	}

	const searchTerm = query.toLowerCase().trim();

	return CSS_PROPERTY_MAPPINGS.filter( ( mapping ) => {
		// Search in property name
		if ( mapping.property.toLowerCase().includes( searchTerm ) ) {
			return true;
		}

		// Search in display name
		if ( mapping.displayName.toLowerCase().includes( searchTerm ) ) {
			return true;
		}

		// Search in keywords
		if ( mapping.keywords.some( ( keyword ) => keyword.toLowerCase().includes( searchTerm ) ) ) {
			return true;
		}

		// Search in section name
		if ( mapping.section.toLowerCase().includes( searchTerm ) ) {
			return true;
		}

		return false;
	} );
}

/**
 * Get CSS property mapping by property name
 * @param property
 */
export function getCSSPropertyMapping( property: string ): CSSPropertyMapping | undefined {
	return CSS_PROPERTY_MAPPINGS.find( ( mapping ) => mapping.property === property );
}

/**
 * Get all properties for a section
 * @param sectionName
 */
export function getSectionProperties( sectionName: string ): string[] {
	const section = SECTIONS_INFO.find( ( s ) => s.name === sectionName );
	return section ? section.properties : [];
}
