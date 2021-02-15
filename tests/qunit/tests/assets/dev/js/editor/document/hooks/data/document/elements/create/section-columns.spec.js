import ElementsHelper from '../../../../../elements/helper';

export const SectionColumns = () => {
	QUnit.module( 'SectionColumns', () => {
		QUnit.test( 'create with structure', ( assert ) => {
			const structure = 10,
				eSection = ElementsHelper.createSectionStructure( 1, structure );

			assert.equal( eSection.settings.get( 'structure' ), structure );
		} );

		QUnit.test( 'create section at index 0 - with section that already in index 0 - ensure options does not forward to columns', ( assert ) => {
			// Resolve issue: ED-1903.
			// Arrange.
			const eSectionInitial = ElementsHelper.createSectionStructure( 3, '32' ),
				eSectionAt0 = ElementsHelper.createSectionStructure( 3, '31', false, {
					at: 0,
				} );

			// Assert.
			assert.equal( eSectionInitial.children[ 0 ].settings.get( '_column_size' ), 50 );
			assert.equal( eSectionAt0.children[ 0 ].settings.get( '_column_size' ), 25 );
		} );

		// TODO: Create section with two columns validate both _column_size is 50,
		// Redo section, validate again if both columns _column_size is 50.

		// TODO: this cause a mass tests failure.
		// QUnit.test( 'apply(): with invalid structure', ( assert ) => {
		// 	const structure = 120;
		//
		// 	assert.throws(
		// 		() => {
		// 			ElementsHelper.createSectionStructure( 1, structure );
		// 		},
		// 		new TypeError( 'The provided structure doesn\'t match the columns count.' )
		// 	);
		// } );
	} );
};

export default SectionColumns;
