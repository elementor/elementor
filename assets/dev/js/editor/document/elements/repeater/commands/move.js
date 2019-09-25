import Base from '../../../commands/base';

export default class extends Base {
	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentType( 'name', 'string', args );
		this.requireArgumentType( 'sourceIndex', 'number', args );
		this.requireArgumentType( 'targetIndex', 'number', args );

	}

	getHistory( args ) {
		const { name, containers = [ args.container ] } = args;

		return {
			containers,
			type: 'move',
			subTitle: elementor.translate( 'Item' ),
		};
	}

	apply( args ) {
		const { sourceIndex, targetIndex, name, containers = [ args.container ] } = args,
			result = [];

		containers.forEach( ( container ) => {
			const collection = container.settings.get( name ),
				model = elementorCommon.helpers.cloneObject( collection.at( sourceIndex ) );

			$e.run( 'document/elements/repeater/remove', {
				container,
				name,
				index: sourceIndex,
			} );

			result.push( $e.run( 'document/elements/repeater/insert', {
				container,
				name,
				model,
				options: { at: targetIndex },
			} ) );
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}
