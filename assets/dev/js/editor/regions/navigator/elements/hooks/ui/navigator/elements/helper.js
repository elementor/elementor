export default class Helper {
	static toggleVisibilityClass( containerId ) {
		const { view } = elementor.getContainer( containerId );

		if ( view ) {
			view.toggleVisibilityClass();
		}
	}
}
