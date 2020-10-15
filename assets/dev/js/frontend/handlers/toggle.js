import TabsModule from './base-tabs';

export default class Toggle extends TabsModule {
	getDefaultSettings() {
		const defaultSettings = super.getDefaultSettings();

		return {
			...defaultSettings,
			showTabFn: 'slideDown',
			hideTabFn: 'slideUp',
			hidePrevious: false,
			autoExpand: 'editor',
		};
	}
}
