export default class Console {
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

	static warn( ... args ) {
		const style = `font-size: 12px; background-image: url("${ elementorWebCliConfig.urls.assets }images/logo-icon.png"); background-repeat: no-repeat; background-size: contain;`;

		args.unshift( '%c  %c', style, '' );

		console.warn( ...args ); // eslint-disable-line no-console
	}
}
