import Dependency from 'elementor-api/modules/hooks/data/dependency';

export class UpdateGlobals extends Dependency {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'update-globals-/document/elements/settings';
	}

	getConditions( args ) {
		return args.settings?.__globals__;
	}

	apply( args ) {
		const globalsSettings = args.settings.__globals__,
			{ containers = [ args.container ] } = args;

		// Run globals settings.
		$e.run( 'document/globals/settings', {
			containers,
			settings: globalsSettings,
		} );

		// Run original settings without __globals__.
		delete args.settings.__globals__;

		$e.run( 'document/elements/settings', args );

		return false; // Hook break.
	}
}

export default UpdateGlobals;
