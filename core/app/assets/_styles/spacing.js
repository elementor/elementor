import spacing from 'elementor-styles/maps/spacing/spacing.js';

export default class Spacing {
	static get( key ) {
		return spacing.values[ key ] && ( spacing.values[ key ] * spacing.base.spacer ) + spacing.base.units;
	}
}
