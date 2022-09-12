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

		const type = container.model.get( 'widgetType' ) || container.model.get( 'elType' );

		const settings = this.settingsExtractors.reduce( ( carry, extractor ) => {
			return {
				...carry,
				...extractor( container ),
			};
		}, {} );

		try {
			const createAndRefetch = async () => {
				await $e.data.create( 'kits-elements-defaults/index', { settings }, { type } );

				$e.data.cache.storage.removeItem( 'kits-elements-defaults' );

				await $e.data.get( 'kits-elements-defaults/index' );
			};

			await Promise.allSettled( [
				createAndRefetch(),
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
