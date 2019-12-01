import DocumentHelper from '../../helper';

export const CopyAll = () => {
	QUnit.module( 'CopyAll', () => {
		QUnit.test( 'Single Selection', ( assert ) => {
			const eSection = DocumentHelper.createSection( 1 ),
				eColumn = DocumentHelper.createColumn( eSection ),
				eButtonsCount = 2;

			for ( let i = 0; i < eButtonsCount; ++i ) {
				DocumentHelper.createButton( eColumn );
			}

			DocumentHelper.copyAll();

			DocumentHelper.empty();

			DocumentHelper.paste( elementor.getPreviewContainer(), true );

			assert.equal( elementor.elements.at( 0 ).get( 'elements' ).at( 1 ).get( 'elements' ).length, eButtonsCount,
				`'${ eButtonsCount }' buttons were created.` );
		} );
	} );
};

export default CopyAll;
