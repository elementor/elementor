export class Duplicate extends $e.modules.editor.document.CommandHistoryBase {
	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentType( 'name', 'string', args );
		this.requireArgumentType( 'index', 'number', args );
	}

	getHistory( args ) {
		const { containers = [ args.container ] } = args;

		return {
			containers,
			type: 'duplicate',
			subTitle: __( 'Item', 'elementor' ),
		};
	}

	apply( args ) {
		const { index, name, options = {}, containers = [ args.container ] } = args,
			result = [];

		containers.forEach( ( container ) => {
			const settingsModel = container.settings,
				collection = settingsModel.get( name ),
				model = collection.at( index ).toJSON();

			// Let the insert handle it, do not use the duplicated id.
			if ( model._id ) {
				delete model._id;
			}

			result.push( $e.run( 'document/repeater/insert', {
				container,
				name,
				model,
				options: Object.assign( {
					at: index + 1,
				}, options ),
				renderAfterInsert: args.renderAfterInsert,
			} ) );
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}

export default Duplicate;
