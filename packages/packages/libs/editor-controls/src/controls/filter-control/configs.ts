import { __ } from '@wordpress/i18n';

export type FilterFunction =
	| 'blur'
	| 'brightness'
	| 'contrast'
	| 'hue-rotate'
	| 'saturate'
	| 'grayscale'
	| 'invert'
	| 'sepia'
	| 'drop-shadow';

export type FilterFunctionGroup = 'blur' | 'color-tone' | 'hue-rotate' | 'intensity' | 'drop-shadow';

export type FilterGroup = {
	[ filter in FilterFunction ]?: {
		name: string;
		valueName?: string;
	};
};

export const FILTERS_BY_GROUP: Record< FilterFunctionGroup, FilterGroup > = {
	blur: {
		blur: {
			name: __( 'Blur', 'elementor' ),
			valueName: __( 'Radius', 'elementor' ),
		},
	},
	intensity: {
		brightness: { name: __( 'Brightness', 'elementor' ) },
		contrast: { name: __( 'Contrast', 'elementor' ) },
		saturate: { name: __( 'Saturate', 'elementor' ) },
	},
	'hue-rotate': {
		'hue-rotate': {
			name: __( 'Hue Rotate', 'elementor' ),
			valueName: __( 'Angle', 'elementor' ),
		},
	},
	'color-tone': {
		grayscale: { name: __( 'Grayscale', 'elementor' ) },
		invert: { name: __( 'Invert', 'elementor' ) },
		sepia: { name: __( 'Sepia', 'elementor' ) },
	},
	'drop-shadow': {
		'drop-shadow': { name: __( 'Drop shadow', 'elementor' ), valueName: __( 'Drop-shadow', 'elementor' ) },
	},
};
