import FinderLayout from './modal-layout';

export default class extends elementorModules.Module {
	onInit() {
		this.channel = Backbone.Radio.channel( 'ELEMENTOR:finder' );

		this.layout = new FinderLayout();

		this.layout.getModal().on( 'hide', () => elementorCommon.route.close( 'finder' ) );

		elementorCommon.route.register( 'finder', () => this.layout.showModal(), 'ctrl+e' );
	}
}
