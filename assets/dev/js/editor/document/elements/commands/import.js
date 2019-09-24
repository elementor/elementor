import Base from '../../commands/base';
import item from "../../../../../../../core/common/modules/finder/assets/js/item";

export default class extends Base {
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
			elementType: 'template',
		};
	}

	apply( args ) {
		const previewContainer = elementor.getPreviewContainer(),
			{ data } = args,
			options = args.options || {},
			at = isNaN( options.at ) ? previewContainer.view.collection.length : options.at;

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
