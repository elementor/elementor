import Component from './component'

export default class Module {
	constructor() {
		elementorCommon.elements.$window.on( 'elementor:init-components', this.onElementorInitComponents.bind( this ) );
	}

	onElementorInitComponents() {
		$e.components.register( new Component() );
	}
}
