export default class View extends $e.components.get( 'nested-elements' ).exports.NestedView {
	filter( child, index ) {
		child.attributes.dataIndex = index + 1;

		return true;
	}

	onAddChild( childView ) {
		// Const index = childView.model.attributes.dataIndex;
		// const widgetNumber = '';
		// const tabId = '';
		//
		// childview.$el.attr( {
		// 	id: 'e-n-tab-content-' + widgetNumber + index,
		// 	role: 'tabpanel',
		// 	'aria-labelledby': tabId,
		// 	'data-tab-index': index,
		// 	style: '--n-tabs-title-order: ' + index + ';',
		// } );

		console.log( childView );
	}
}
