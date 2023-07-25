export default class View extends $e.components.get( 'nested-elements' ).exports.NestedView {
	filter( child, index ) {
		child.attributes.dataIndex = index + 1;

		return true;
	}

	onAddChild( childView ) {
		const widgetNumber = childView._parent.$el.find( '.e-n-tabs' )[ 0 ].attributes.widgetNumber,
			index = childView.model.attributes.dataIndex;

		// ChildView.$el.attr( {
		// 	id: 'e-n-tab-content-' + widgetNumber + '' + index,
		// 	role: 'tabpanel',
		// 	'aria-labelledby': widgetNumber + '' + index,
		// 	'data-tab-index': index,
		// 	style: '--n-tabs-title-order: ' + index + ';',
		// } );
		//
		// if ( 1 === index ) {
		// 	childView.$el.addClass( 'e-active' );
		// }
	}
}
