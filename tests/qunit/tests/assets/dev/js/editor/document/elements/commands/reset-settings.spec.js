import ElementsHelper from '../helper';
import HistoryHelper from '../../history/helper';

export const ResetSettings = () => {
	QUnit.module( 'ResetSettings', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButtonStyled = ElementsHelper.createAutoButtonStyled();

				// Ensure editor saver.
				$e.internal( 'document/save/set-is-modified', { status: false } );

				ElementsHelper.resetSettings( eButtonStyled );

				// Check pasted style exist.
				assert.equal( eButtonStyled.settings.attributes.background_color, '',
					'Button with custom style were (style) restored.' );
				assert.equal( elementor.saver.isEditorChanged(), true,
					'Command applied the saver editor is changed.' );
			} );

			QUnit.test( 'Specific properties', ( assert ) => {
				const eButtonStyled = ElementsHelper.createAutoButtonStyled();

				ElementsHelper.resetSettings( eButtonStyled, [ 'text' ] );

				// Check pasted style exist.
				assert.equal( eButtonStyled.settings.attributes.text, 'Click here',
					'Button with custom style were (style) restored.' );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eWidgetStyled = ElementsHelper.createAutoButtonStyled(),
					BackgroundBeforeReset = eWidgetStyled.settings.get( 'background_color' ); // Black

				ElementsHelper.resetSettings( eWidgetStyled );

				const BackgroundAfterReset = eWidgetStyled.settings.get( 'background_color' ), // No Color
					historyItem = HistoryHelper.getFirstItem().attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'reset_settings', 'Button' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				assert.equal( eWidgetStyled.settings.get( 'background_color' ), BackgroundBeforeReset,
					'Settings back to default.' );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				assert.equal( eWidgetStyled.settings.get( 'background_color' ), BackgroundAfterReset,
					'Settings restored.' );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButtonStyled1 = ElementsHelper.createAutoButtonStyled(),
					eButtonStyled2 = ElementsHelper.createAutoButtonStyled();

				ElementsHelper.multiResetSettings( [ eButtonStyled1, eButtonStyled2 ] );

				// Check pasted style exist.
				assert.equal( eButtonStyled1.model.attributes.settings.attributes.background_color, '',
					'Button #1 with custom style were (style) restored.' );
				assert.equal( eButtonStyled2.model.attributes.settings.attributes.background_color, '',
					'Button #2 with custom style were (style) restored.' );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eWidgetsStyled = ElementsHelper.multiCreateAutoButtonStyled(),
					backgroundBeforeReset = eWidgetsStyled[ 0 ].settings.get( 'background_color' );

				ElementsHelper.multiResetSettings( eWidgetsStyled );

				const backgroundAfterReset = eWidgetsStyled[ 0 ].settings.get( 'background_color' ),
					historyItem = HistoryHelper.getFirstItem().attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'reset_settings', 'Elements' );

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

export default ResetSettings;
