export default class extends elementorModules.Component {
	getTabs() {
		return {
			general: elementor.translate( 'general' ),
			style: elementor.translate( 'style' ),
			advanced: elementor.translate( 'advanced' ),
		};
	}
}
