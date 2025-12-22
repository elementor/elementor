import { AtomicWidgetsSelectors } from '../../../../selectors/atomic-widgets-selectors';

export const WIDGET_CONFIGS = {
	HEADING: {
		type: 'e-heading',
		selector: AtomicWidgetsSelectors.heading.base,
		defaultSize: '32px',
	},
	PARAGRAPH: {
		type: 'e-paragraph',
		selector: AtomicWidgetsSelectors.paragraph.base,
		defaultSize: '16px',
	},
	BUTTON: {
		type: 'e-button',
		selector: AtomicWidgetsSelectors.button.base,
		defaultSize: '15px',
	},
	E_HEADING: {
		type: 'e-heading',
		selector: AtomicWidgetsSelectors.heading.base,
		defaultSize: '32px',
	},
	E_PARAGRAPH: {
		type: 'e-paragraph',
		selector: AtomicWidgetsSelectors.paragraph.base,
		defaultSize: '16px',
	},
	E_BUTTON: {
		type: 'e-button',
		selector: AtomicWidgetsSelectors.button.base,
		defaultSize: '15px',
	},
};

export const FONT_FAMILIES = {
	system: 'Arial',
	systemAlt: 'Times New Roman',
	google: 'Open Sans',
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

export type Unit = typeof UNITS[keyof typeof UNITS];
export type UnitKey = keyof typeof UNITS;

export const SPACING_VALUES = {
	POSITIVE: [ 1, 5.5 ],
	NEGATIVE: [ -1, -5.5 ],
	UNITS: Object.values( UNITS ),
};

export const TYPOGRAPHY_DECORATIONS = {
	UNDERLINE: {
		buttonName: 'Underline',
		cssProperty: 'text-decoration-line',
		activeValue: 'underline',
		inactiveValue: 'none',
	},
	ITALIC: {
		buttonName: 'Italic',
		cssProperty: 'font-style',
		activeValue: 'italic',
		inactiveValue: 'normal',
	},
	UPPERCASE: {
		buttonName: 'Uppercase',
		cssProperty: 'text-transform',
		activeValue: 'uppercase',
		inactiveValue: 'none',
	},
	RTL: {
		buttonName: 'Right to left',
		cssProperty: 'direction',
		activeValue: 'rtl',
		inactiveValue: 'ltr',
	},
	TEXT_STROKE: {
		addButtonName: 'Add',
		removeButtonName: 'Remove',
		cssProperty: '-webkit-text-stroke-width',
		defaultValue: '1px',
		removedValue: '0px',
	},
} as const;
