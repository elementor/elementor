import DocumentHelper from '../../../helper';

export const SectionColumns = () => {
	QUnit.module( 'SectionColumns', () => {
		QUnit.test( 'apply(): with structure', ( assert ) => {
			const structure = 10,
				eSection = DocumentHelper.createSectionStructure( 1, structure );

			assert.equal( eSection.settings.get( 'structure' ), structure );
		} );

		// TODO: Handle it somehow cause failure of many tests.
		// QUnit.test( 'apply(): with invalid structure', ( assert ) => {
		// 	const structure = 120;
		//
		// 	assert.throws(
		// 		() => {
		// 			DocumentHelper.createSectionStructure( 1, structure );
		// 		},
		// 		new TypeError( 'The provided structure doesn\'t match the columns count.' )
		// 	);
		// } );
	} );
};

export default SectionColumns;
