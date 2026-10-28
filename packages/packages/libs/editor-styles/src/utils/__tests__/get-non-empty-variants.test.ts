import { type StyleDefinition } from '../../types';
import { getNonEmptyVariants } from '../get-non-empty-variants';

const DESKTOP_META = { breakpoint: 'desktop', state: null } as const;
const MOBILE_META = { breakpoint: 'mobile', state: null } as const;

const createStyle = ( variants: StyleDefinition[ 'variants' ] ): StyleDefinition => ( {
	id: 'heading',
	label: 'heading',
	type: 'class',
	variants,
} );

describe( 'getNonEmptyVariants', () => {
	it( 'should remove an emptied variant without dropping the remaining breakpoint', () => {
		// Arrange
		const style = createStyle( [
			{
				meta: DESKTOP_META,
				props: {},
				custom_css: null,
			},
			{
				meta: MOBILE_META,
				props: { margin: '8px' },
				custom_css: null,
			},
		] );

		// Act
		const variants = getNonEmptyVariants( style );

		// Assert
		expect( variants ).toEqual( [
			{
				meta: MOBILE_META,
				props: { margin: '8px' },
				custom_css: null,
			},
		] );
	} );

	it( 'should keep variants that only contain custom CSS', () => {
		// Arrange
		const style = createStyle( [
			{
				meta: DESKTOP_META,
				props: {},
				custom_css: { raw: '.selector { color: red; }' },
			},
			{
				meta: MOBILE_META,
				props: {},
				custom_css: null,
			},
		] );

		// Act
		const variants = getNonEmptyVariants( style );

		// Assert
		expect( variants ).toEqual( [
			{
				meta: DESKTOP_META,
				props: {},
				custom_css: { raw: '.selector { color: red; }' },
			},
		] );
	} );
} );
