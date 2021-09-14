import CommandBase from 'elementor-api/modules/command-base';

export class SelectAll extends CommandBase {
	apply( args ) {
		elementor.selection.add(
			this.flattenContainersList(
				elementor.elementsModel.get( 'elements' ).map( ( element ) => {
					return elementor.getContainer( element.id );
				} )
			)
		);
	}

	flattenContainersList( containers = [] ) {
		let flatten = [];

		for ( const container of containers ) {
			flatten.push( container );

			if ( container.children.length ) {
				flatten = flatten.concat( this.flattenContainersList( container.children ) );
			}
		}

		return flatten;
	}
}

export default SelectAll;
