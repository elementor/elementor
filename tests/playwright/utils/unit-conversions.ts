import { Unit, UNITS } from '../sanity/modules/v4-tests/typography/typography-constants';

interface ComputedStyles {
	fontSize: number;
	parentFontSize?: number;
	windowWidth: number;
	windowHeight: number;
}

export function convertToPixels( value: number, unit: Unit, styles: ComputedStyles ): number {
	if ( UNITS.px === unit ) {
		return value;
	}

	const conversions = {
		[ UNITS.em ]: () => value * ( styles.parentFontSize ?? 16 ),
		[ UNITS.rem ]: () => value * 16, // 1rem = 16px
		[ UNITS.vw ]: () => ( value * styles.windowWidth ) / 100,
		[ UNITS.vh ]: () => ( value * styles.windowHeight ) / 100,
		[ UNITS.percent ]: () => ( value * ( styles.parentFontSize ?? 16 ) ) / 100,
	} as const;

	return conversions[ unit ]?.() ?? value;
}
