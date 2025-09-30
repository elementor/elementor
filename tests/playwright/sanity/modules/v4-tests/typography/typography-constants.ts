export const WIDGET_CONFIGS = {
	HEADING: {
		type: 'e-heading',
		selector: '.e-heading-base',
		defaultSize: '32px',
	},
	PARAGRAPH: {
		type: 'e-paragraph',
		selector: '.e-paragraph-base',
		defaultSize: '16px',
	},
	BUTTON: {
		type: 'e-button',
		selector: '.e-button-base',
		defaultSize: '15px',
	},
	E_HEADING: {
		type: 'e-heading',
		selector: '.e-heading-base',
		defaultSize: '32px',
	},
	E_PARAGRAPH: {
		type: 'e-paragraph',
		selector: '.e-paragraph-base',
		defaultSize: '16px',
	},
	E_BUTTON: {
		type: 'e-button',
		selector: '.e-button-base',
		defaultSize: '15px',
	},
};

export const FONT_FAMILIES = {
	system: 'Arial',
	systemAlt: 'Times New Roman',
	google: 'Roboto',
	trebuchet: 'Trebuchet MS',
};

export const FONT_SIZES = {
	DESKTOP: '24',
	TABLET: '18',
	MOBILE: '16',
};

export const UNITS = {
	px: 'px',
	em: 'em',
	rem: 'rem',
	vw: 'vw',
	vh: 'vh',
	percent: '%',
} as const;

export type Unit = keyof typeof UNITS;

export const SPACING_VALUES = {
	POSITIVE: [ 1, 5.5 ],
	NEGATIVE: [ -1, -5.5 ],
	UNITS: Object.values( UNITS ),
};
