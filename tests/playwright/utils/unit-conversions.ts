interface ComputedStyles {
	fontSize: number;
	windowWidth: number;
	windowHeight: number;
}

export function convertToPixels( value: number, unit: string, styles: ComputedStyles ): number {
	if ( 'px' === unit ) {
		return value;
	}

	const conversions = {
		em: () => value * styles.fontSize,
		rem: () => value * 16, // 1rem = 16px
		vw: () => ( value * styles.windowWidth ) / 100,
		vh: () => ( value * styles.windowHeight ) / 100,
		'%': () => ( value * styles.fontSize ) / 100,
	};

	return conversions[ unit ]?.() ?? value;
}
