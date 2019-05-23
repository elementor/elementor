import Component from './component';

export default class extends elementorModules.Module {
	onInit() {
		this.channel = Backbone.Radio.channel( 'ELEMENTOR:finder' );

		elementorCommon.components.register( new Component( { context: this } ) );
	}
}
