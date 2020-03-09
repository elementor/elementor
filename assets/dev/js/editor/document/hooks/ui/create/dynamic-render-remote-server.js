import After from 'elementor-api/modules/hooks/ui/after';

export class DynamicRenderRemoteServer extends After {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'dynamic-render-remote-server';
	}

	getConditions( args, result ) {
		return result.settings.get( '__dynamic__' );
	}

	apply( args, result ) {
		const containers = Array.isArray( result ) ? result : [ result ];

		containers.forEach( ( /* Container */ container ) => {
			container.model.renderRemoteServer();
		} );
	}

}

export default DynamicRenderRemoteServer;
