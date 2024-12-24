import TabsModule from './base-tabs.js';

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

window.elementorModules.frontend.widgets = elementorModules.frontend.widgets || {};
window.elementorModules.frontend.widgets[ 'toggle.default' ] = Toggle;
