import After from 'elementor-api/modules/hooks/data/after';

export class ElementsCreateAddDefaultGlobals extends After {
	getCommand() {
		return 'document/elements/create';
	}

	getConditions( args, result ) {
		// TODO: Remove - Create testing compatibility.
		return ! elementorCommonConfig.isTesting;
	}

	getId() {
		return 'document/elements/create::add-default-globals';
	}

	apply( args, result ) {
		const containers = Array.isArray( result ) ? result : [ result ];

		containers.forEach( ( /* Container */ container ) => {
			Object.entries( container.controls ).forEach( ( [ controlName, control ] ) => {
				if ( control.global?.default ) {
					const element = container.model.toJSON();

					if ( ! element.settings.__globals__ ) {
						element.settings.__globals__ = {};
					}

					element.settings.__globals__[ controlName ] = control.global.default;

					const component = $e.components.get( 'editor/documents' ),
						command = 'editor/documents/elements',
						query = {
							documentId: container.document.id,
							elementId: element.id,
						};

					$e.data.setCache( component, command, query, element );
				}
			} );
		} );
	}
}

export default ElementsCreateAddDefaultGlobals;
