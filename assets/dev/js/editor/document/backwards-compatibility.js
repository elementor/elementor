export default class BackwardsCompatibility {
	startInsertTemplate( model ) {
		elementor.documents.getCurrent().history.startItem( {
			type: 'add',
			title: __( 'Template', 'elementor' ),
			subTitle: model.get( 'title' ),
			elementType: 'template',
		} );
	}

	endItem() {
		elementor.documents.getCurrent().history.endItem();
	}
}
