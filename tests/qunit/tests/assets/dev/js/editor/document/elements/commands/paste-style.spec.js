import ElementsHelper from '../helper';
import HistoryHelper from '../../history/helper';
import * as eData from 'elementor/tests/qunit/mock/e-data';

export const PasteStyle = () => {
	QUnit.module( 'PasteStyle', () => {
		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'History', ( assert ) => {
				const eWidgetsSimple = ElementsHelper.multiCreateWrappedButton(),
					eWidgetStyled = ElementsHelper.createWrappedButton( null, {
						text: 'createAutoButtonStyled',
						background_color: '#000000',
					} ),
					widgetSimpleBackground = eWidgetsSimple[ 0 ].settings.get( 'background_color' ),
					widgetStyledBackground = eWidgetStyled.settings.get( 'background_color' );

				ElementsHelper.copy( eWidgetStyled );
				ElementsHelper.multiPasteStyle( eWidgetsSimple );

				const historyItem = HistoryHelper.getFirstItem().attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'paste_style', 'Elements' );

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
