import ElementsHelper from '../helper';

export const CopyAll = () => {
	QUnit.module( 'CopyAll', () => {
		QUnit.test( 'Single Selection', ( assert ) => {
			const eSection = ElementsHelper.createSection( 1 ),
				eColumn = ElementsHelper.createColumn( eSection ),
				eButtonsCount = 2;

			for ( let i = 0; i < eButtonsCount; ++i ) {
				ElementsHelper.createButton( eColumn );
			}

			ElementsHelper.copyAll();

			ElementsHelper.empty();

			ElementsHelper.paste( elementor.getPreviewContainer(), true );

			assert.equal( elementor.elements.at( 0 ).get( 'elements' ).at( 1 ).get( 'elements' ).length, eButtonsCount,
				`'${ eButtonsCount }' buttons were created.` );
		} );
	} );
};

export default CopyAll;
