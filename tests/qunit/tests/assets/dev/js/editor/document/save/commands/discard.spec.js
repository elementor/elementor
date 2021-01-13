import ElementsHelper from '../../elements/helper';

export const Discard = () => {
	QUnit.test( 'Discard', async ( assert ) => {
		const eSections = [];

		// Remove all elements.
		ElementsHelper.empty();

		// Create two sections.
		eSections.push( ElementsHelper.createSection( 1 ) );
		eSections.push( ElementsHelper.createSection( 1 ) );

		// Run discard.
		const result = await $e.run( 'document/save/discard' );

		// Validate result, is successfully.
		assert.equal( result, true );

		// Validate that two sections is not available.
		eSections.forEach( ( eSection ) =>
			assert.equal(
				Boolean( $e.components.get( 'document' ).utils.findViewById( eSection.id ) ),
				false
			)
		);
	} );
};

export default Discard;
