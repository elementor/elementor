export const IMAGE_ACTIONS = {
	USE: 'use',
	REFERENCE: 'reference',
	ZOOM: 'zoom',
};

export const SCREENS = {
	GENERATE: 'generate',
	GENERATE_RESULTS: 'generate-results',
	VARIATIONS: 'variations',
	GALLERY: 'gallery',
};

export const PANELS = {
	TEXT_TO_IMAGE: 'text-to-image',
	IMAGE_TO_IMAGE: 'image-to-image',
};

export const IMAGE_PROMPT_SETTINGS = {
	STYLE_PRESET: 'style_preset',
	IMAGE_TYPE: 'image_type',
	IMAGE_STRENGTH: 'image_strength',
};

export const IMAGE_PROMPT_CATEGORIES = [
	{
		key: '',
		label: __( 'None', 'elementor' ),
		subCategories: {},
	},
	{
		key: 'photographic',
		label: __( 'Photographic', 'elementor' ),
		subCategories: {
			'': __( 'None', 'elementor' ),
			landscape: __( 'Landscape', 'elementor' ),
			macro: __( 'Macro', 'elementor' ),
			portrait: __( 'Portrait', 'elementor' ),
			'long-exposure': __( 'Long Exposure', 'elementor' ),
		},
	},
	{
		key: 'background',
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
	{
		key: 'digital-art',
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
	{
		key: 'handmade',
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
	{
		key: '3d',
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
];
