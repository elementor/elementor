import { AlignItemsField } from '../components/style-sections/layout-section/align-items-field';
import { GapControlField } from '../components/style-sections/layout-section/gap-control-field';
import { TextColorField } from '../components/style-sections/typography-section/text-color-field';
import { getStylesFieldComponent } from '../styles-field-registry';

describe( 'getStylesFieldComponent', () => {
	it.each( [
		[ 'gap', GapControlField ],
		[ 'align-items', AlignItemsField ],
		[ 'color', TextColorField ],
	] )( 'should return the existing field component for "%s"', ( propKey, component ) => {
		// Act.
		const result = getStylesFieldComponent( propKey );

		// Assert.
		expect( result ).toBe( component );
	} );

	it.each( [ 'padding', 'background', 'not-a-style-prop' ] )(
		'should return null for "%s", which has no standalone field',
		( propKey ) => {
			// Act.
			const result = getStylesFieldComponent( propKey );

			// Assert.
			expect( result ).toBeNull();
		}
	);
} );
