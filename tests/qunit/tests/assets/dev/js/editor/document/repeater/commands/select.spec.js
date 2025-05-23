import ElementsHelper from '../../elements/helper';
import HistoryHelper from '../../history/helper';
import RepeaterHelper from '../helper';

export const Select = () => {
	QUnit.module( 'Select', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				// Arrange.
				const indexToSelect = 2,
					eColumn = ElementsHelper.createSection( 1, true ),
					eTabs = ElementsHelper.createWidgetTabs( eColumn );

				// Act.
				RepeaterHelper.select( eTabs, indexToSelect );

				// Assert.
				assert.equal( eTabs.model.get( 'editSettings' ).get( 'activeItemIndex' ), indexToSelect );
			} );

			QUnit.test( 'History', ( assert ) => {
				// Arrange.
				const indexToSelect = 2,
					eColumn = ElementsHelper.createSection( 1, true ),
					eTabs = ElementsHelper.createWidgetTabs( eColumn );

				// Act.
				RepeaterHelper.select( eTabs, indexToSelect );

				// Assert.
				const historyItem = HistoryHelper.getFirstItem().attributes;

				HistoryHelper.inHistoryValidate( assert, historyItem, 'selected', 'Tabs' );

				assert.equal( historyItem.subTitle, 'Item #2' );
			} );

			QUnit.test( 'History - Validate history not created when selecting same index.', ( assert ) => {
				// Arrange.
				HistoryHelper.resetItems();

				const indexToSelect = 2,
					eColumn = ElementsHelper.createSection( 1, true ),
					eTabs = ElementsHelper.createWidgetTabs( eColumn );

				// Act.
				RepeaterHelper.select( eTabs, indexToSelect );
				RepeaterHelper.select( eTabs, indexToSelect );

				// Assert.
				assert.equal( elementor.history.history.getItems().length, 4 );
			} );
		} );
	} );
};

export default Select;
