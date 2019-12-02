import Base from '../../commands/base/base';
import DocumentUtils from 'elementor-document/utils/helpers';

export class Paste extends Base {
	initialize( args ) {
		const { containers = [ args.container ] } = args;

		super.initialize( args );

		this.storage = elementorCommon.storage.get( 'clipboard' );

		this.storage = this.storage.map( ( model ) =>
			new Backbone.Model( model )
		);

		if ( ! containers[ 0 ] ) {
			this.target = elementor.getCurrentElement();
			this.target = this.target ? [ this.target.getContainer() ] : null;
		} else {
			this.target = containers;
		}
	}

	validateArgs( args ) {
		this.requireArgumentType( 'storage', 'object', this );
		//this.requireArgumentType( 'target', 'array', this );
	}

	apply( args ) {
		if ( ! this.target ) {
			return false;
		}

		return this.target.some( ( /* Container */ container ) => {
			const { options = {} } = args,
				pasteOptions = DocumentUtils.getPasteOptions( this.storage[ 0 ], container );

			if ( ! pasteOptions.isValidChild ) {
				if ( pasteOptions.isSameElement ) {
					if ( 'document' === container.parent.type ) {
						options.at = container.parent.model.get( 'elements' ).findIndex( container.model );
					}

					container = container.parent;
				} else if ( pasteOptions.isValidGrantChild ) {
					options.rebuild = options.rebuild || true;
				}
			}

			if ( Object.values( pasteOptions ).some( ( opt ) => !! opt ) ) {
				const commandArgs = { container };

				if ( undefined !== options.rebuild ) {
					commandArgs.rebuild = options.rebuild;
				}

				if ( undefined !== options.at ) {
					commandArgs.at = options.at;
				}

				return $e.run( 'document/elements/paste', commandArgs );
			}

			return false;
		} );
	}
}

export default Paste;
