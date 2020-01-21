import ElementsHelper from '../../elements/helper';
import HistoryHelper from '../../history/helper';

export const PasteStyle = () => {
	QUnit.module( 'PasteStyle', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButtonSimple = ElementsHelper.createAutoButton(),
					eButtonStyled = ElementsHelper.createAutoButtonStyled(),
					eStyledButtonBackground = eButtonStyled.settings.attributes.background_color;

				ElementsHelper.copy( eButtonStyled );

				// Ensure editor saver.
				elementor.saver.setFlagEditorChange( false );

				ElementsHelper.pasteStyle( eButtonSimple );

				// Check
				assert.equal( eButtonSimple.settings.attributes.background_color, eStyledButtonBackground,
					`Button background color was changed to '${ eStyledButtonBackground }'.` );
				assert.equal( elementor.saver.isEditorChanged(), true,
					'Command applied the saver editor is changed.' );
			} );

			QUnit.test( 'On column', ( assert ) => {
				const eColumnSimple = ElementsHelper.createAutoColumn(),
					eColumnStyled = ElementsHelper.createAutoColumnStyled(),
					eStyledButtonBackground = eColumnStyled.settings.attributes.background_color;

				ElementsHelper.copy( eColumnStyled );
				ElementsHelper.pasteStyle( eColumnSimple );

				// Check
				assert.equal( eColumnSimple.settings.attributes.background_color, eStyledButtonBackground,
					`Button background color was changed to '${ eStyledButtonBackground }'.` );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eWidgetSimple = ElementsHelper.createAutoButton(),
					eWidgetStyled = ElementsHelper.createAutoButtonStyled(),
					widgetSimpleBackground = eWidgetSimple.settings.get( 'background_color' );

				//widgetStyledBackground = eWidgetStyled.settings.get( 'background_color' );

				ElementsHelper.copy( eWidgetStyled );
				ElementsHelper.pasteStyle( eWidgetSimple );

				const historyItem = HistoryHelper.getFirstItem().attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'paste_style', 'Button' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				assert.equal( eWidgetSimple.settings.get( 'background_color' ), widgetSimpleBackground,
					'Settings back to default.' );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				/*assert.equal( eWidgetSimple.settings.get( 'background_color' ), widgetSimpleBackground,
					'Settings restored.' ); // TODO: in tests its not back to default color.*/
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButtonSimple1 = ElementsHelper.createAutoButton(),
					eButtonSimple2 = ElementsHelper.createAutoButton(),
					eButtonStyled = ElementsHelper.createAutoButtonStyled(),
					eStyledButtonBackground = eButtonStyled.settings.attributes.background_color;

				ElementsHelper.copy( eButtonStyled );

				ElementsHelper.multiPasteStyle( [ eButtonSimple1, eButtonSimple2 ] );

				// Check pasted style exist.
				assert.equal( eButtonSimple1.model.attributes.settings.attributes.background_color, eStyledButtonBackground,
					`Button #1 background color was changed to '${ eStyledButtonBackground }'.` );
				assert.equal( eButtonSimple2.model.attributes.settings.attributes.background_color, eStyledButtonBackground,
					`Button #2 background color was changed to '${ eStyledButtonBackground }'.` );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eWidgetsSimple = ElementsHelper.multiCreateAutoButton(),
					eWidgetStyled = ElementsHelper.createAutoButtonStyled(),
					widgetSimpleBackground = eWidgetsSimple[ 0 ].settings.get( 'background_color' ),
					widgetStyledBackground = eWidgetStyled.settings.get( 'background_color' );

				ElementsHelper.copy( eWidgetStyled );
				ElementsHelper.multiPasteStyle( eWidgetsSimple );

				const historyItem = HistoryHelper.getFirstItem().attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'paste_style', 'elements' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				eWidgetsSimple.forEach( ( eWidgetSimple ) => {
					assert.equal( eWidgetSimple.settings.get( 'background_color' ), widgetSimpleBackground,
						'Settings back to default.' );
				} );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				eWidgetsSimple.forEach( ( eWidgetSimple ) => {
					assert.equal( eWidgetSimple.settings.get( 'background_color' ), widgetStyledBackground,
						'Settings restored.' );
				} );
			} );
		} );
	} );
};

export default PasteStyle;
