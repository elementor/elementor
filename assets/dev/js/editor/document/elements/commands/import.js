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
		const { data, options = args.options || {} } = args,
			previewContainer = elementor.getPreviewContainer();

		let { at = isNaN( options.at ) ? previewContainer.view.collection.length : options.at } = args;

		// Each `data.content`.
		Object.entries( data.content ).forEach( ( [ index, model ] ) => {
			$e.run( 'document/elements/create', {
				container: elementor.getPreviewContainer(),
				model,
				options: Object.assign( options, { at } ),
			} );
			at++;
		} );

		if ( options.withPageSettings ) {
			$e.run( 'document/elements/settings', {
				container: elementor.settings.page.getEditedView().getContainer(),
				settings: data.page_settings,
				options: {
					external: true,
				},
			} );
		}
	}
}

export default Import;
