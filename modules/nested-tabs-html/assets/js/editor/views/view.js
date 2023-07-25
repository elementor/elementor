export default class View extends $e.components.get( 'nested-elements' ).exports.NestedView {
	filter( child, index ) {
		child.attributes.dataIndex = index + 1;

		return true;
	}

	onAddChild( childView ) {
		childView.$el.attr( 'data-content', childView.model.attributes.dataIndex );
		childView.$el.attr( 'data-content1', '123' );
	}
}
