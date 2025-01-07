import TabsModule from './base-tabs.js';

export default class Tabs extends TabsModule {
	getDefaultSettings() {
		const defaultSettings = super.getDefaultSettings();

		return {
			...defaultSettings,
			toggleSelf: false,
		};
	}
}

window.elementorModules.frontend.widgets = elementorModules.frontend.widgets || {};
window.elementorModules.frontend.widgets[ 'tabs.default' ] = Tabs;
