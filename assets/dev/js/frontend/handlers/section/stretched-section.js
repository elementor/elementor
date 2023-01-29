export default class StretchedSection extends elementorModules.frontend.handlers.StretchedElement {
	getDefaultSettings() {
		return {
			classes: {
				stretched: 'elementor-section-stretched',
			},
			stretchSettingName: 'stretch_section',
		};
	}
}
