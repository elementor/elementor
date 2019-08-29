import Base from '../commands/base';

export default class extends Base {
	validateArgs( args ) {
		this.requireElements( args );

		this.requireArgument( 'name', args );
		this.requireArgument( 'sourceIndex', args );
		this.requireArgument( 'targetIndex', args );
	}

	getHistory( args ) {
		const { name, elements = [ args.element ] } = args;

		return {
			elements,
			type: 'move',
			subTitle: elementor.translate( 'Item' ),
		};
	}

	apply( args ) {
		const { sourceIndex, targetIndex, name, elements = [ args.element ] } = args,
			result = [];

		elements.forEach( ( element ) => {
			const settingsModel = element.getEditModel().get( 'settings' ),
				collection = settingsModel.get( name ),
				model = elementorCommon.helpers.cloneObject( collection.at( sourceIndex ) );

			$e.run( 'document/elements/repeater/remove', {
				element,
				name,
				index: sourceIndex,
			} );

			result.push( $e.run( 'document/elements/repeater/insert', {
				element,
				name,
				model,
				returnValue: true,
				options: { at: targetIndex },
			} ) );
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}
