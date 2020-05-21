import After from 'elementor-api/modules/hooks/ui/after';

export class EnqueueFonts extends After {
	getCommand() {
		return 'document/globals/enable';
	}

	getId() {
		return 'enqueue-fonts';
	}

	getConditions( args ) {
		return Object.values( args.settings ).some( ( setting ) => setting.includes( 'typography' ) );
	}

	apply( args ) {
		const { settings } = args;

		Object.values( settings ).forEach( async ( setting ) => {
			if ( setting.includes( 'typography' ) ) {
				const newArgs = { query: {} },
					result = await $e.data.get( $e.data.endpointToCommand( setting, newArgs ), newArgs.query );

				// eslint-disable-next-line camelcase
				if ( result.data?.font_family ) {
					elementor.helpers.enqueueFont( result.data.font_family );
				}
			}
		} );

		return true;
	}
}

export default EnqueueFonts;
