import Component from './component';

export default class extends elementorModules.Module {
	onInit() {
		this.channel = Backbone.Radio.channel( 'ELEMENTOR:finder' );

		$e.components.register( new Component( { manager: this } ) );
	}
}
