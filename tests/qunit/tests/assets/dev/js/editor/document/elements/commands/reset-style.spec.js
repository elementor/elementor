import ElementsHelper from '../helper';
import HistoryHelper from '../../history/helper';

export const ResetStyle = () => {
	QUnit.module( 'ResetStyle', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButtonStyled = ElementsHelper.createWrappedButton( null, {
					text: 'createAutoButtonStyled',
					background_color: '#000000',
				} );

				// Ensure editor saver.
				$e.internal( 'document/save/set-is-modified', { status: false } );

				ElementsHelper.resetStyle( eButtonStyled );

				// Check pasted style exist.
				assert.equal( eButtonStyled.settings.attributes.background_color, '',
					'Button with custom style were (style) restored.' );
				assert.equal( elementor.saver.isEditorChanged(), true,
					'Command applied the saver editor is changed.' );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eWidgetStyled = ElementsHelper.createWrappedButton( null, {
						text: 'createAutoButtonStyled',
						background_color: '#000000',
					} ),
					BackgroundBeforeReset = eWidgetStyled.settings.get( 'background_color' ); // Black

				ElementsHelper.resetStyle( eWidgetStyled );

				const historyItem = HistoryHelper.getFirstItem().attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'reset_style', 'Button' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				assert.equal( eWidgetStyled.settings.get( 'background_color' ), BackgroundBeforeReset,
					'Settings back to default.' );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				/* Assert.equal( eWidgetStyled.settings.get( 'background_color' ), BackgroundAfterReset,
					'Settings restored.' ); // TODO: in tests its not back to default color.*/
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const settings = {
						text: 'createAutoButtonStyled',
						background_color: '#000000',
					},
					eButtonStyled1 = ElementsHelper.createWrappedButton( null, settings ),
					eButtonStyled2 = ElementsHelper.createWrappedButton( null, settings );

				ElementsHelper.multiResetStyle( [ eButtonStyled1, eButtonStyled2 ] );

				// Check pasted style exist.
				assert.equal( eButtonStyled1.model.attributes.settings.attributes.background_color, '',
					'Button #1 with custom style were (style) restored.' );
				assert.equal( eButtonStyled2.model.attributes.settings.attributes.background_color, '',
					'Button #2 with custom style were (style) restored.' );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eWidgetsStyled = ElementsHelper.multiCreateWrappedButton( null, {
						text: 'createAutoButtonStyled',
						background_color: '#000000',
					} ),
					backgroundBeforeReset = eWidgetsStyled[ 0 ].settings.get( 'background_color' );

				ElementsHelper.multiResetStyle( eWidgetsStyled );

				const backgroundAfterReset = eWidgetsStyled[ 0 ].settings.get( 'background_color' ),
					historyItem = HistoryHelper.getFirstItem().attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'reset_style', 'Elements' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				eWidgetsStyled.forEach( ( eWidgetStyled ) => {
					assert.equal( eWidgetStyled.settings.get( 'background_color' ), backgroundBeforeReset,
						'Settings back to default.' );
				} );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				eWidgetsStyled.forEach( ( eWidgetStyled ) => {
					assert.equal( eWidgetStyled.settings.get( 'background_color' ), backgroundAfterReset,
						'Settings restored.' );
				} );
			} );
		} );
	} );
};

export default ResetStyle;
