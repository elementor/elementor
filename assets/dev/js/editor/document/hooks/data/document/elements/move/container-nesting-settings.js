import After from 'elementor-api/modules/hooks/data/after';

/**
 * @typedef {import('../../../../../../container/container')} Container
 */
export class ContainerNestingSettings extends After {
	getCommand() {
		return 'document/elements/move';
	}

	getId() {
		return 'container-nesting-settings';
	}

	getContainerType() {
		return 'container';
	}

	getConditions( args ) {
		const { containers = [ args.container ], target } = args;

		return containers.some( ( /** Container */ container ) => container.parent !== target );
	}

	apply( args, result ) {
		const containers = Array.isArray( result ) ? result : [ result ];

		containers.forEach( ( /** Container */ container ) => {
			if ( ! container ) {
				return;
			}

			const isTopLevel = 'document' === container.parent.model.get( 'elType' );

			container.model.set( 'isInner', ! isTopLevel );

			// Nested containers must be full-width. Un-nesting does not restore a previous
			// content_width: that value is not stored, so inventing `boxed` would mutate saved data.
			if ( isTopLevel ) {
				return;
			}

			$e.run( 'document/elements/settings', {
				container,
				settings: {
					content_width: 'full',
				},
			} );
		} );

		return true;
	}
}

export default ContainerNestingSettings;
