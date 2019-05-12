import FinderLayout from './modal-layout';
import Component from './component';

export default class extends elementorModules.Module {
	onInit() {
		this.channel = Backbone.Radio.channel( 'ELEMENTOR:finder' );

		this.layout = new FinderLayout();

		elementorCommon.components.register( 'finder', new Component(), { parent: this } );
	}
}
