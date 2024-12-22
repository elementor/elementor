export default class View extends $e.components.get( 'nested-elements' ).exports.NestedView {
	filter( child, index ) {
		child.attributes.dataIndex = index + 1;

		return true;
	}

	onAddChild( childView ) {
		const widgetNumber = childView._parent.$el.find( '.e-n-tabs' )[ 0 ]?.dataset.widgetNumber,
			index = childView.model.attributes.dataIndex,
			tabId = childView._parent.$el.find( `.e-n-tab-title[data-tab-index="${ index }"]` )?.attr( 'id' );

		childView.$el.attr( {
			id: 'e-n-tab-content-' + widgetNumber + '' + index,
			role: 'tabpanel',
			'aria-labelledby': tabId,
			'data-tab-index': index,
			style: '--n-tabs-title-order: ' + index + ';',
		} );

		const isInitialLoad = elementor.previewView.isBuffering;

		if ( isInitialLoad && 1 === index ) {
			childView.$el.addClass( 'e-active' );
		}
	}
}
