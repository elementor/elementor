import Base from '../../commands/base';

export default class extends Base {
	validateArgs( args ) {
		this.requireArgumentInstance( 'model', Backbone.Model, args );

		this.requireArgumentConstructor( 'data', Object, args );
	}

	getHistory( args ) {
		// Manual history.
		return false;
	}

	apply( args ) {
		const { model, data } = args,
			options = args.options || {},
			historyId = $e.run( 'document/history/startLog', {
				type: 'add',
				title: elementor.translate( 'template' ),
				subTitle: model.get( 'title' ),
				elementType: 'template',
				returnValue: true,
			} );

		elementor.getPreviewView().addChildModel( data.content, options );

		if ( options.withPageSettings ) {
			elementor.settings.page.model.setExternalChange( data.page_settings );
		}

		$e.run( 'document/history/endLog', { id: historyId } );
	}
}
