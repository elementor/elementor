import ElementsHelper from '../helper';
import HistoryHelper from '../../history/helper';

// TODO: Check code coverage and add required tests.
export const Paste = () => {
	QUnit.module( 'Paste', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eButton = ElementsHelper.createWidgetButton( eColumn );

				ElementsHelper.copy( eButton );

				// Ensure editor saver.
				$e.internal( 'document/save/set-is-modified', { status: false } );

				ElementsHelper.paste( eColumn );

				// Check.
				assert.equal( elementor.elements.at( 0 ).get( 'elements' ).at( 0 ).get( 'elements' ).length, 2,
					'Pasted element were created.' );
				assert.equal( elementor.saver.isEditorChanged(), true,
					'Command applied the saver editor is changed.' );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eSection1 = ElementsHelper.createSection(),
					eSection2 = ElementsHelper.createSection(),
					eColumns = ElementsHelper.multiCreateColumn( [ eSection1, eSection2 ] ),
					eButton = ElementsHelper.createWidgetButton( eColumns[ 0 ] ),
					eHeading = ElementsHelper.createWidgetHeading( eColumns[ 0 ] ),
					toCopy = [ eButton, eHeading ];

				ElementsHelper.multiCopy( toCopy.slice().reverse() );

				ElementsHelper.paste( eColumns[ 1 ] );

				// Check pasted elements existence.
				assert.equal( eColumns[ 1 ].children.length, 2, `Both elements pasted.` );

				// Check whether they preserved their order.
				for ( let i = 0; i < toCopy.length; i++ ) {
					assert.equal(
						eColumns[ 1 ].model.get( 'elements' ).models[ i ].get( 'widgetType' ),
						toCopy[ i ].model.get( 'widgetType' ),
						`Element ${ i + 1 } preserved its order.`,
					);
				}
			} );

			QUnit.test( 'Columns', ( assert ) => {
				const eSection1 = ElementsHelper.createSection( 2 ),
					eSection2 = ElementsHelper.createSection(),
					eColumn1 = eSection1.children[ 0 ],
					eColumn2 = eSection1.children[ 1 ],
					toCopy = [ eColumn1, eColumn2 ];

				// We want to create different widgets in different columns in order to check later whether the paste
				// order is preserved using the `widgetType`.
				ElementsHelper.createWidgetButton( eColumn1 );

				ElementsHelper.createWidgetHeading( eColumn2 );

				ElementsHelper.multiCopy( toCopy.slice().reverse() );

				ElementsHelper.paste( eSection2 );

				// Check pasted elements existence.
				assert.equal( eSection2.children.length, 3, `Both elements pasted.` );

				// Check whether they preserved their order.
				for ( let i = 0; i < toCopy.length; i++ ) {
					assert.equal(
						toCopy[ i ].children[ 0 ].model.get( 'widgetType' ),
						eSection2.children[ i + 1 ].model.get( 'elements' ).models[ 0 ].get( 'widgetType' ),
						`Column ${ i + 1 } preserved its order.`,
					);
				}
			} );
		} );
	} );
};

export default Paste;
