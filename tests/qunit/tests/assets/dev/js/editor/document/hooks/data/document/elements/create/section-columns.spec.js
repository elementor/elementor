import ElementsHelper from '../../../../../elements/helper';

export const SectionColumns = () => {
	QUnit.module( 'SectionColumns', () => {
		QUnit.test( 'create with structure', ( assert ) => {
			const structure = 10,
				eSection = ElementsHelper.createSectionStructure( 1, structure );

			assert.equal( eSection.settings.get( 'structure' ), structure );
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
