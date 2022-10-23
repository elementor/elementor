import localSettingsExtractor from '../settings-handlers/local/extract';
import store from '../store';

export default class Create extends $e.modules.CommandBase {
	settingsExtractors = [
		localSettingsExtractor,
	];

	validateArgs() {
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
			await store.put( type, settings );

			// TODO: Show success toast.
		} catch ( e ) {
			// TODO: Show error toast.
		} finally {
			$e.internal( 'panel/state-ready' );
		}
	}
}
