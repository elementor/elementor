import localSettingsExtractor from '../settings-handlers/local/extract';

export default class Create extends $e.modules.CommandBase {
	settingsExtractors = [
		localSettingsExtractor,
	];

	validateArgs( args = {} ) {
		this.requireContainer();
	}

	async apply( { container } ) {
		$e.internal( 'panel/state-loading' );

		const type = container.widgetType || container.elType;

		const settings = this.settingsExtractors.reduce( ( carry, extractor ) => {
			return {
				...carry,
				...extractor( container ),
			};
		}, {} );

		try {
			await Promise.allSettled( [
				$e.data.create( 'kits-elements-defaults/index', { settings }, { id: type } ),
				new Promise( ( reslove ) => setTimeout( reslove, 800 ) ),
			] );

			// Here we should open some toast
		} catch ( e ) {
			// Show some error.
		} finally {
			$e.internal( 'panel/state-ready' );
		}
	}
}
