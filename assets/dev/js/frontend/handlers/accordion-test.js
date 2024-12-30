import TabsModule from './base-tabs.js';

export default class Accordion extends TabsModule {
	getDefaultSettings() {
		const defaultSettings = super.getDefaultSettings();

		return {
			...defaultSettings,
			showTabFn: 'slideDown',
			hideTabFn: 'slideUp',
		};
	}
}

window.elementorModules.frontend.widgets = elementorModules.frontend.widgets || {};
window.elementorModules.frontend.widgets[ 'accordion.default' ] = Accordion;
