export default class Helpers {
	static error( message ) {
		// Show an error if devTools is available.
		if ( $e.devTools ) {
			$e.devTools.log.error( message );
		}

		// If not a 'Hook-Break' then show error.
		if ( ! ( message instanceof $e.modules.HookBreak ) ) {
			// eslint-disable-next-line no-console
			console.error( message );
		}
	}
}
