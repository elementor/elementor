module.exports = class ElementRepeaterModel extends elementor.modules.elements.models.Element {
	initialize( options ) {
		if ( $e.commands.isCurrentFirstTrace( 'document/elements/create' ) ) {
			setTimeout( () => {
				const name = elementor.widgetsCache[ this.get( 'widgetType' ) ].name;

				this.attributes.settings.get( name ).forEach( () => {
					const container = elementor.getContainer( this.id );

					const sectionView = container.view.addElement( new ElementRepeaterModel( {
						id: elementorCommon.helpers.getUniqueId(),
						elType: 'section', // TODO Dynamic?
						settings: new Backbone.Model(),
						elements: [],
					} ) );

					sectionView.addElement( new ElementRepeaterModel( {
						id: elementorCommon.helpers.getUniqueId(),
						elType: 'column', // TODO Dynamic?
						settings: new Backbone.Model( {
							_column_size: 100,
						} ),
						elements: [],
					} ) );
				} );
			}, 1000 );
		}

		super.initialize( options );
	}
};
