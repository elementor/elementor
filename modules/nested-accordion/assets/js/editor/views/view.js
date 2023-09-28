export default class View extends $e.components.get( 'nested-elements' ).exports.NestedView {
	onAddChild( childView ) {
		const accordionId = childView._parent.$el.find( 'summary' )?.attr( 'aria-controls' );

		childView.$el.attr( {
			role: 'region',
			'aria-labelledby': accordionId,
		} );
	}
}
