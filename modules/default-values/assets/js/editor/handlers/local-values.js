import BaseHandler from './base-handler';

export default class LocalValues extends BaseHandler {
	appendSettingsForSave( settings, container ) {
		const controls = container.settings.controls;
		const settingsWithoutHardcodedDefaults = container.settings.toJSON( { remove: [ 'hardcoded-default' ] } );

		const localSettings = Object.entries( settingsWithoutHardcodedDefaults ).filter(
			( [ controlName ] ) => controls[ controlName ] && container.view.isStyleTransferControl( controls[ controlName ] )
		);

		return {
			...settings,
			...Object.fromEntries( localSettings ),
		};
	}

	appendSettingsForRecreate( element ) {
		return element;
	}
}
