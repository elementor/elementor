import After from 'elementor-api/modules/hooks/data/after';

export class HandleDynamic extends After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'handle-dynamic';
	}

	getContainerType() {
		return 'dynamic';
	}

	getConditions( args ) {
		const { containers = [ args.container ] } = args;

		return containers.some( ( /**Container*/ container ) => 'dynamic' === container.type );
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /**Container*/ container ) => {
			if ( 'dynamic' === container.type ) {
				const tagText = elementor.dynamicTags.tagContainerToTagText( container ),
					commandArgs = {
						container: container.parent,
						settings: {
							[ container.view.options.controlName ]: tagText,
						},
					};

				$e.run( 'document/dynamic/settings', commandArgs );
			}
		} );

		return true;
	}
}

export default HandleDynamic;
