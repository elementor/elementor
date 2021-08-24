import TabsModule from './base-tabs';

export default class Tabs extends TabsModule {
	getDefaultSettings() {
		const defaultSettings = super.getDefaultSettings();

		return {
			...defaultSettings,
			toggleSelf: false,
		};
	}
}
