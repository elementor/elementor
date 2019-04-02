import FinderLayout from './modal-layout';

export default class extends elementorModules.Module {
	onInit() {
		this.channel = Backbone.Radio.channel( 'ELEMENTOR:finder' );

		this.layout = new FinderLayout();

		this.layout.getModal().on( 'hide', () => elementorCommon.route.close( 'finder' ) );

		elementorCommon.route.registerComponent( 'finder', {
			open: () => {
				this.layout.showModal();
				return true;
			},
			close: () => this.layout.getModal().hide(),
		} );

		elementorCommon.route.register( 'finder', () => {}, { keys: 'ctrl+e' } );
	}
}
