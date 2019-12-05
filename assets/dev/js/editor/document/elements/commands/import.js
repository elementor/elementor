import History from '../../commands/base/history';

export class Import extends History {
	validateArgs( args ) {
		this.requireArgumentInstance( 'model', Backbone.Model, args );

		this.requireArgumentConstructor( 'data', Object, args );
	}

	getHistory( args ) {
		const { model } = args;

		return {
			type: 'add',
			title: elementor.translate( 'template' ),
			subTitle: model.get( 'title' ),
		};
	}

	apply( args ) {
		const previewContainer = elementor.getPreviewContainer(),
			{
				data,
				options = args.options || {},
				at = isNaN( options.at ) ? previewContainer.view.collection.length : options.at,
			} = args;

		// Each `data.content`.
		Object.entries( data.content ).forEach( ( [ index, model ] ) => {
			$e.run( 'document/elements/create', {
				container: elementor.getPreviewContainer(),
				model,
				options: Object.assign( { at: at + index }, options ),
			} );
		} );

		if ( options.withPageSettings ) {
			// TODO: use settings command.
			elementor.settings.page.model.setExternalChange( data.page_settings );
		}
	}
}

export default Import;
