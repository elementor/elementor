export default class StretchedSection extends elementorModules.frontend.handlers.StretchedElement {
	getStretchedClass() {
		return 'elementor-section-stretched';
	}

	getStretchSettingName() {
		return 'stretch_section';
	}

	getStretchActiveValue() {
		return 'section-stretched';
	}
}
