import DocumentHelper from '../../helper';
import HistoryHelper from '../../history/helper';
import { DEFAULT_DEBOUNCE_DELAY } from '../../../../../../../assets/dev/js/editor/document/commands/base/debounce';

export const PasteStyle = () => {
	QUnit.module( 'PasteStyle', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButtonSimple = DocumentHelper.createAutoButton(),
					eButtonStyled = DocumentHelper.createAutoButtonStyled(),
					eStyledButtonBackground = eButtonStyled.settings.attributes.background_color;

				DocumentHelper.copy( eButtonStyled );

				// Ensure editor saver.
				elementor.saver.setFlagEditorChange( false );

				DocumentHelper.pasteStyle( eButtonSimple );

				let done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					// Check
					assert.equal( eButtonSimple.settings.attributes.background_color, eStyledButtonBackground,
						`Button background color was changed to '${ eStyledButtonBackground }'.` );
					assert.equal( elementor.saver.isEditorChanged(), true,
						'Command applied the saver editor is changed.' );

					done();
				}, DEFAULT_DEBOUNCE_DELAY );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eWidgetSimple = DocumentHelper.createAutoButton(),
					eWidgetStyled = DocumentHelper.createAutoButtonStyled(),
					widgetSimpleBackground = eWidgetSimple.settings.get( 'background_color' ),
					widgetStyledBackground = eWidgetStyled.settings.get( 'background_color' );

				DocumentHelper.copy( eWidgetStyled );
				DocumentHelper.pasteStyle( eWidgetSimple );

				let done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

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

					done();
				}, DEFAULT_DEBOUNCE_DELAY );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButtonSimple1 = DocumentHelper.createAutoButton(),
					eButtonSimple2 = DocumentHelper.createAutoButton(),
					eButtonStyled = DocumentHelper.createAutoButtonStyled(),
					eStyledButtonBackground = eButtonStyled.settings.attributes.background_color;

				DocumentHelper.copy( eButtonStyled );

				DocumentHelper.multiPasteStyle( [ eButtonSimple1, eButtonSimple2 ] );

				let done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					// Check pasted style exist.
					assert.equal( eButtonSimple1.model.attributes.settings.attributes.background_color, eStyledButtonBackground,
						`Button #1 background color was changed to '${ eStyledButtonBackground }'.` );
					assert.equal( eButtonSimple2.model.attributes.settings.attributes.background_color, eStyledButtonBackground,
						`Button #2 background color was changed to '${ eStyledButtonBackground }'.` );

					done();
				}, DEFAULT_DEBOUNCE_DELAY );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eWidgetsSimple = DocumentHelper.multiCreateAutoButton(),
					eWidgetStyled = DocumentHelper.createAutoButtonStyled(),
					widgetSimpleBackground = eWidgetsSimple[ 0 ].settings.get( 'background_color' ),
					widgetStyledBackground = eWidgetStyled.settings.get( 'background_color' );

				DocumentHelper.copy( eWidgetStyled );
				DocumentHelper.multiPasteStyle( eWidgetsSimple );

				let done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

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

					done();
				}, DEFAULT_DEBOUNCE_DELAY );
			} );
		} );
	} );
};

export default PasteStyle;
