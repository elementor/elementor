import { __ } from '@wordpress/i18n';
export const LOCATIONS = {
	RESIZE: 'resize',
	GENERATE: 'generate',
	VARIATIONS: 'variations',
	IMAGE_TOOLS: 'image-tools',
	IN_PAINTING: 'in-painting',
	OUT_PAINTING: 'out-painting',
	REMOVE_BACKGROUND: 'remove-background',
	REPLACE_BACKGROUND: 'replace-background',
	REMOVE_TEXT: 'remove-text',
};

export const IMAGE_PROMPT_SETTINGS = {
	IMAGE_TYPE: 'image_type',
	IMAGE_STYLE: 'style_preset',
	IMAGE_STRENGTH: 'image_strength',
	IMAGE_RATIO: 'ratio',
	IMAGE_ZOOM: 'zoom',
	IMAGE_UPSCALE: 'upscale_to',
};

export const IMAGE_PROMPT_CATEGORIES = {
	'': {
		label: __( 'None', 'elementor' ),
		subCategories: {},
	},
	photographic: {
		label: __( 'Photographic', 'elementor' ),
		subCategories: {
			'': __( 'None', 'elementor' ),
			landscape: __( 'Landscape', 'elementor' ),
			macro: __( 'Macro', 'elementor' ),
			portrait: __( 'Portrait', 'elementor' ),
			'long-exposure': __( 'Long Exposure', 'elementor' ),
			product: __( 'Product', 'elementor' ),
			photorealistic: __( 'Photorealistic', 'elementor' ),
		},
	},
	background: {
		label: __( 'Background', 'elementor' ),
		subCategories: {
			'': __( 'None', 'elementor' ),
			floral: __( 'Floral', 'elementor' ),
			gradient: __( 'Gradient', 'elementor' ),
			mosaic: __( 'Mosaic', 'elementor' ),
			neon: __( 'Neon', 'elementor' ),
			bokeh: __( 'Bokeh', 'elementor' ),
		},
	},
	handmade: {
		label: __( 'Handmade', 'elementor' ),
		subCategories: {
			'': __( 'None', 'elementor' ),
			doodle: __( 'Doodle', 'elementor' ),
			'line-art': __( 'Line Art', 'elementor' ),
			'oil-painting': __( 'Oil Painting', 'elementor' ),
			'pencil-drawing': __( 'Pencil Drawing', 'elementor' ),
			watercolor: __( 'Watercolor', 'elementor' ),
		},
	},
	'digital-art': {
		label: __( 'Digital Art', 'elementor' ),
		subCategories: {
			'': __( 'None', 'elementor' ),
			amine: __( 'Anime', 'elementor' ),
			cartoon: __( 'Cartoon', 'elementor' ),
			cinematic: __( 'Cinematic', 'elementor' ),
			'comic-book': __( 'Comic Book', 'elementor' ),
			'fantasy-art': __( 'Fantasy Art', 'elementor' ),
			isometric: __( 'Isometric', 'elementor' ),
			vector: __( 'Vector', 'elementor' ),
			'pixel-art': __( 'Pixel Art', 'elementor' ),
			'low-poly': __( 'Low Poly', 'elementor' ),
			'neon-punk': __( 'Neon Punk', 'elementor' ),
		},
	},
	'3d': {
		label: __( '3D', 'elementor' ),
		subCategories: {
			'': __( 'None', 'elementor' ),
			clay: __( 'Clay', 'elementor' ),
			digital: __( 'Digital', 'elementor' ),
			origami: __( 'Origami', 'elementor' ),
			stone: __( 'Stone', 'elementor' ),
			wood: __( 'Wood', 'elementor' ),
		},
	},
};

export const IMAGE_ASPECT_RATIO = {
	'1:1': {
		width: 512,
		height: 512,
		label: __( 'Square', 'elementor' ) + ' (1:1)',
	},
	'3:2': {
		width: 640,
		height: 448,
		label: __( 'Landscape', 'elementor' ) + ' (3:2)',
	},
	'4:3': {
		width: 640,
		height: 448,
		label: __( 'Landscape', 'elementor' ) + ' (4:3)',
	},
	'16:9': {
		width: 704,
		height: 384,
		label: __( 'Landscape', 'elementor' ) + ' (16:9)',
	},
	'2:3': {
		width: 448,
		height: 640,
		label: __( 'Portrait', 'elementor' ) + ' (2:3)',
	},
	'3:4': {
		width: 448,
		height: 640,
		label: __( 'Portrait', 'elementor' ) + ' (3:4)',
	},
	'9:16': {
		width: 384,
		height: 704,
		label: __( 'Portrait', 'elementor' ) + ' (9:16)',
	},
};
