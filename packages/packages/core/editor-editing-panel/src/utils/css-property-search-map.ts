import { __ } from '@wordpress/i18n';

export type CSSPropertyMapping = {
	property: string;
	section: string;
	sectionTitle: string;
	displayName: string;
	description: string;
	keywords: string[];
};

export type SectionInfo = {
	name: string;
	description: string;
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
		description: __(
			'Controls how an element is displayed - as a block, inline, flex container, or hidden from view',
			'elementor'
		),
		keywords: [ 'display', 'block', 'flex', 'inline', 'layout' ],
	},
	{
		property: 'flex-direction',
		section: 'Layout',
		sectionTitle: __( 'Layout', 'elementor' ),
		displayName: __( 'Flex Direction', 'elementor' ),
		description: __(
			'Sets the direction for flex items - arrange them in a row, column, or their reverse directions',
			'elementor'
		),
		keywords: [ 'flex', 'direction', 'row', 'column', 'layout' ],
	},
	{
		property: 'flex-wrap',
		section: 'Layout',
		sectionTitle: __( 'Layout', 'elementor' ),
		displayName: __( 'Flex Wrap', 'elementor' ),
		description: __( 'Controls whether flex items wrap to new lines when they run out of space', 'elementor' ),
		keywords: [ 'flex', 'wrap', 'nowrap', 'layout' ],
	},
	{
		property: 'justify-content',
		section: 'Layout',
		sectionTitle: __( 'Layout', 'elementor' ),
		displayName: __( 'Justify Content', 'elementor' ),
		description: __(
			'Aligns flex items along the main axis - center them, space them out, or push to edges',
			'elementor'
		),
		keywords: [ 'justify', 'content', 'flex', 'alignment', 'center', 'start', 'end' ],
	},
	{
		property: 'align-items',
		section: 'Layout',
		sectionTitle: __( 'Layout', 'elementor' ),
		displayName: __( 'Align Items', 'elementor' ),
		description: __(
			'Aligns flex items along the cross axis - center them vertically or horizontally',
			'elementor'
		),
		keywords: [ 'align', 'items', 'flex', 'alignment', 'center', 'start', 'end' ],
	},
	{
		property: 'align-content',
		section: 'Layout',
		sectionTitle: __( 'Layout', 'elementor' ),
		displayName: __( 'Align Content', 'elementor' ),
		description: __( 'Aligns wrapped flex lines when there is extra space in the cross-axis', 'elementor' ),
		keywords: [ 'align', 'content', 'flex', 'alignment' ],
	},
	{
		property: 'align-self',
		section: 'Layout',
		sectionTitle: __( 'Layout', 'elementor' ),
		displayName: __( 'Align Self', 'elementor' ),
		description: __( 'Overrides the align-items value for a specific flex item', 'elementor' ),
		keywords: [ 'align', 'self', 'flex', 'alignment' ],
	},
	{
		property: 'gap',
		section: 'Layout',
		sectionTitle: __( 'Layout', 'elementor' ),
		displayName: __( 'Gap', 'elementor' ),
		description: __(
			'Creates consistent spacing between flex or grid items without affecting outer edges',
			'elementor'
		),
		keywords: [ 'gap', 'spacing', 'flex', 'grid' ],
	},

	// Spacing Section
	{
		property: 'margin',
		section: 'Spacing',
		sectionTitle: __( 'Spacing', 'elementor' ),
		displayName: __( 'Margin', 'elementor' ),
		description: __( 'Controls the outer space around an element - pushes other elements away', 'elementor' ),
		keywords: [ 'margin', 'spacing', 'outer', 'space' ],
	},
	{
		property: 'padding',
		section: 'Spacing',
		sectionTitle: __( 'Spacing', 'elementor' ),
		displayName: __( 'Padding', 'elementor' ),
		description: __(
			'Controls the inner space inside an element - creates breathing room between content and borders',
			'elementor'
		),
		keywords: [ 'padding', 'spacing', 'inner', 'space' ],
	},

	// Size Section
	{
		property: 'width',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Width', 'elementor' ),
		description: __( 'Sets how wide an element should be - make it narrow, wide, or fit its content', 'elementor' ),
		keywords: [ 'width', 'size', 'dimension' ],
	},
	{
		property: 'min-width',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Min Width', 'elementor' ),
		description: __(
			'Sets the smallest width an element can shrink to - prevents it from getting too narrow',
			'elementor'
		),
		keywords: [ 'min', 'width', 'minimum', 'size' ],
	},
	{
		property: 'max-width',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Max Width', 'elementor' ),
		description: __(
			'Sets the largest width an element can grow to - prevents it from getting too wide',
			'elementor'
		),
		keywords: [ 'max', 'width', 'maximum', 'size' ],
	},
	{
		property: 'height',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Height', 'elementor' ),
		description: __( 'Sets how tall an element should be - make it short, tall, or fit its content', 'elementor' ),
		keywords: [ 'height', 'size', 'dimension' ],
	},
	{
		property: 'min-height',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Min Height', 'elementor' ),
		description: __(
			'Sets the smallest height an element can shrink to - prevents it from getting too short',
			'elementor'
		),
		keywords: [ 'min', 'height', 'minimum', 'size' ],
	},
	{
		property: 'max-height',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Max Height', 'elementor' ),
		description: __(
			'Sets the largest height an element can grow to - prevents it from getting too tall',
			'elementor'
		),
		keywords: [ 'max', 'height', 'maximum', 'size' ],
	},
	{
		property: 'overflow',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Overflow', 'elementor' ),
		description: __(
			'Controls what happens when content is too big for its container - hide it, show scrollbars, or let it spill out',
			'elementor'
		),
		keywords: [ 'overflow', 'hidden', 'scroll', 'visible' ],
	},
	{
		property: 'aspect-ratio',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Aspect Ratio', 'elementor' ),
		description: __(
			'Maintains a specific width-to-height proportion - keeps images and videos from stretching',
			'elementor'
		),
		keywords: [ 'aspect', 'ratio', 'proportion', 'size' ],
	},
	{
		property: 'object-fit',
		section: 'Size',
		sectionTitle: __( 'Size', 'elementor' ),
		displayName: __( 'Object Fit', 'elementor' ),
		description: __(
			'Controls how images and videos fit within their containers - crop, stretch, or contain them',
			'elementor'
		),
		keywords: [ 'object', 'fit', 'cover', 'contain', 'image' ],
	},

	// Position Section
	{
		property: 'position',
		section: 'Position',
		sectionTitle: __( 'Position', 'elementor' ),
		displayName: __( 'Position', 'elementor' ),
		description: __(
			'Controls how an element is positioned - normal flow, relative to itself, or fixed to the viewport',
			'elementor'
		),
		keywords: [ 'position', 'relative', 'absolute', 'fixed', 'sticky' ],
	},
	{
		property: 'z-index',
		section: 'Position',
		sectionTitle: __( 'Position', 'elementor' ),
		displayName: __( 'Z-Index', 'elementor' ),
		description: __(
			'Controls which elements appear in front of others - like layering pieces of paper',
			'elementor'
		),
		keywords: [ 'z-index', 'layer', 'stacking', 'order' ],
	},
	{
		property: 'scroll-margin-top',
		section: 'Position',
		sectionTitle: __( 'Position', 'elementor' ),
		displayName: __( 'Scroll Margin Top', 'elementor' ),
		description: __(
			'Adds space above an element when scrolling to it - useful for fixed headers that might cover content',
			'elementor'
		),
		keywords: [ 'scroll', 'margin', 'anchor', 'offset' ],
	},

	// Typography Section
	{
		property: 'font-family',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Font Family', 'elementor' ),
		description: __(
			'Choose the typeface for your text - make it modern, classic, playful, or professional',
			'elementor'
		),
		keywords: [ 'font', 'family', 'typeface', 'text' ],
	},
	{
		property: 'font-weight',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Font Weight', 'elementor' ),
		description: __( 'Controls how thick or thin the text appears - make it bold, light, or normal', 'elementor' ),
		keywords: [ 'font', 'weight', 'bold', 'thin', 'text' ],
	},
	{
		property: 'font-size',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Font Size', 'elementor' ),
		description: __(
			'Controls how big or small the text appears - make headlines large and fine print small',
			'elementor'
		),
		keywords: [ 'font', 'size', 'text', 'typography' ],
	},
	{
		property: 'text-align',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Text Align', 'elementor' ),
		description: __(
			'Controls how text lines up - center it, align to left or right edges, or justify across the width',
			'elementor'
		),
		keywords: [ 'text', 'align', 'alignment', 'center', 'left', 'right' ],
	},
	{
		property: 'color',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Color', 'elementor' ),
		description: __(
			'Sets the color of the text - make it bright, subtle, or match your brand colors',
			'elementor'
		),
		keywords: [ 'color', 'text', 'font' ],
	},
	{
		property: 'line-height',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Line Height', 'elementor' ),
		description: __(
			'Controls the space between lines of text - make it tight for headlines or loose for easy reading',
			'elementor'
		),
		keywords: [ 'line', 'height', 'spacing', 'text' ],
	},
	{
		property: 'letter-spacing',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Letter Spacing', 'elementor' ),
		description: __(
			'Controls the space between individual letters - spread them out for elegance or tighten for compactness',
			'elementor'
		),
		keywords: [ 'letter', 'spacing', 'text', 'kerning' ],
	},
	{
		property: 'word-spacing',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Word Spacing', 'elementor' ),
		description: __(
			'Controls the space between words - increase for better readability or decrease for tighter text',
			'elementor'
		),
		keywords: [ 'word', 'spacing', 'text' ],
	},
	{
		property: 'column-count',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Column Count', 'elementor' ),
		description: __(
			'Splits text into multiple columns like a newspaper - useful for long articles and better readability',
			'elementor'
		),
		keywords: [ 'column', 'count', 'multi', 'text' ],
	},
	{
		property: 'text-decoration',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Text Decoration', 'elementor' ),
		description: __(
			'Adds visual effects to text - underline links, strike through deleted text, or remove default decorations',
			'elementor'
		),
		keywords: [ 'text', 'decoration', 'underline', 'strikethrough' ],
	},
	{
		property: 'text-transform',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Text Transform', 'elementor' ),
		description: __(
			'Changes the case of text - make it all uppercase, lowercase, or capitalize each word',
			'elementor'
		),
		keywords: [ 'text', 'transform', 'uppercase', 'lowercase', 'capitalize' ],
	},
	{
		property: 'direction',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Direction', 'elementor' ),
		description: __(
			'Sets the text reading direction - left-to-right for English or right-to-left for Arabic and Hebrew',
			'elementor'
		),
		keywords: [ 'direction', 'rtl', 'ltr', 'text' ],
	},
	{
		property: 'font-style',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Font Style', 'elementor' ),
		description: __(
			'Makes text italic or normal - use italic for emphasis, quotes, or stylistic effect',
			'elementor'
		),
		keywords: [ 'font', 'style', 'italic', 'normal' ],
	},
	{
		property: 'stroke',
		section: 'Typography',
		sectionTitle: __( 'Typography', 'elementor' ),
		displayName: __( 'Stroke', 'elementor' ),
		description: __(
			'Adds an outline around text characters - creates hollow or outlined text effects',
			'elementor'
		),
		keywords: [ 'stroke', 'text', 'outline' ],
	},

	// Background Section
	{
		property: 'background',
		section: 'Background',
		sectionTitle: __( 'Background', 'elementor' ),
		displayName: __( 'Background', 'elementor' ),
		description: __(
			'Sets what appears behind your content - solid colors, images, gradients, or patterns',
			'elementor'
		),
		keywords: [ 'background', 'bg', 'color', 'image', 'gradient' ],
	},

	// Border Section
	{
		property: 'border-radius',
		section: 'Border',
		sectionTitle: __( 'Border', 'elementor' ),
		displayName: __( 'Border Radius', 'elementor' ),
		description: __(
			'Rounds the corners of elements - make sharp rectangles into soft rounded shapes or perfect circles',
			'elementor'
		),
		keywords: [ 'border', 'radius', 'rounded', 'corner' ],
	},
	{
		property: 'border-width',
		section: 'Border',
		sectionTitle: __( 'Border', 'elementor' ),
		displayName: __( 'Border Width', 'elementor' ),
		description: __(
			'Controls how thick the border line is - make it thin and subtle or thick and bold',
			'elementor'
		),
		keywords: [ 'border', 'width', 'thickness' ],
	},
	{
		property: 'border-color',
		section: 'Border',
		sectionTitle: __( 'Border', 'elementor' ),
		displayName: __( 'Border Color', 'elementor' ),
		description: __(
			'Sets the color of the border - match your theme or make it stand out as an accent',
			'elementor'
		),
		keywords: [ 'border', 'color' ],
	},
	{
		property: 'border-style',
		section: 'Border',
		sectionTitle: __( 'Border', 'elementor' ),
		displayName: __( 'Border Style', 'elementor' ),
		description: __(
			'Changes the appearance of the border line - solid, dashed, dotted, or decorative patterns',
			'elementor'
		),
		keywords: [ 'border', 'style', 'solid', 'dashed', 'dotted' ],
	},

	// Effects Section
	{
		property: 'box-shadow',
		section: 'Effects',
		sectionTitle: __( 'Effects', 'elementor' ),
		displayName: __( 'Box Shadow', 'elementor' ),
		description: __(
			'Adds a shadow behind elements - creates depth, elevation, and makes things appear to float above the page',
			'elementor'
		),
		keywords: [ 'box', 'shadow', 'drop', 'effect' ],
	},
	{
		property: 'opacity',
		section: 'Effects',
		sectionTitle: __( 'Effects', 'elementor' ),
		displayName: __( 'Opacity', 'elementor' ),
		description: __(
			'Controls how see-through an element is - make it fully visible, completely transparent, or somewhere in between',
			'elementor'
		),
		keywords: [ 'opacity', 'transparency', 'alpha', 'effect' ],
	},
	{
		property: 'transform',
		section: 'Effects',
		sectionTitle: __( 'Effects', 'elementor' ),
		displayName: __( 'Transform', 'elementor' ),
		description: __(
			'Moves, rotates, scales, or skews elements - create dynamic layouts and eye-catching animations',
			'elementor'
		),
		keywords: [ 'transform', 'rotate', 'scale', 'translate', 'effect' ],
	},
	{
		property: 'filter',
		section: 'Effects',
		sectionTitle: __( 'Effects', 'elementor' ),
		displayName: __( 'Filter', 'elementor' ),
		description: __(
			'Applies visual effects like blur, brightness, contrast, and color adjustments - like Instagram filters for your elements',
			'elementor'
		),
		keywords: [ 'filter', 'blur', 'brightness', 'contrast', 'effect' ],
	},
	{
		property: 'backdrop-filter',
		section: 'Effects',
		sectionTitle: __( 'Effects', 'elementor' ),
		displayName: __( 'Backdrop Filter', 'elementor' ),
		description: __(
			'Applies blur and other effects to the area behind an element - creates frosted glass and modern overlay effects',
			'elementor'
		),
		keywords: [ 'backdrop', 'filter', 'blur', 'effect' ],
	},
	{
		property: 'transform-origin',
		section: 'Effects',
		sectionTitle: __( 'Effects', 'elementor' ),
		displayName: __( 'Transform Origin', 'elementor' ),
		description: __(
			'Sets the point around which transformations happen - rotate from the center, corner, or any custom point',
			'elementor'
		),
		keywords: [ 'transform', 'origin', 'center', 'effect' ],
	},
	{
		property: 'transition',
		section: 'Effects',
		sectionTitle: __( 'Effects', 'elementor' ),
		displayName: __( 'Transition', 'elementor' ),
		description: __(
			'Creates smooth animations when properties change - makes hover effects and interactions feel polished and professional',
			'elementor'
		),
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
		description: __(
			'Controls how elements are arranged and positioned relative to each other - create flexible, responsive layouts',
			'elementor'
		),
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
		description: __(
			'Manages the space around and inside elements - create breathing room and proper visual hierarchy',
			'elementor'
		),
		properties: [ 'margin', 'padding' ],
	},
	{
		name: 'Size',
		title: __( 'Size', 'elementor' ),
		description: __(
			'Controls the dimensions and how content fits within elements - make things bigger, smaller, or responsive',
			'elementor'
		),
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
		description: __(
			'Controls where elements appear on the page and how they stack - create overlays, sticky elements, and layered designs',
			'elementor'
		),
		properties: [ 'position', 'z-index', 'scroll-margin-top' ],
	},
	{
		name: 'Typography',
		title: __( 'Typography', 'elementor' ),
		description: __(
			'Styles all aspects of text appearance - fonts, sizes, colors, spacing, and special effects for readable, beautiful text',
			'elementor'
		),
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
		description: __(
			'Sets what appears behind your content - colors, images, gradients, and patterns to enhance visual appeal',
			'elementor'
		),
		properties: [ 'background' ],
	},
	{
		name: 'Border',
		title: __( 'Border', 'elementor' ),
		description: __(
			'Creates frames and outlines around elements - add definition, separation, and style with various border effects',
			'elementor'
		),
		properties: [ 'border-radius', 'border-width', 'border-color', 'border-style' ],
	},
	{
		name: 'Effects',
		title: __( 'Effects', 'elementor' ),
		description: __(
			'Adds visual enhancements and animations - shadows, transparency, transforms, and filters for modern, engaging designs',
			'elementor'
		),
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
