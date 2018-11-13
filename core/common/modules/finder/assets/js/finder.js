import FinderLayout from './modal-layout';

export default class extends elementorModules.utils.Module {
	initLayout() {
		let layout;

		this.getLayout = () => {
			if ( ! layout ) {
				layout = new FinderLayout();
			}

			return layout;
		};
	}

	addShortcut() {
		const E_KEY = 69;

		elementorCommon.hotKeys.addHotKeyHandler( E_KEY, 'finder', {
			isWorthHandling: ( event ) => elementorCommon.hotKeys.isControlEvent( event ),
			handle: () => this.getLayout().showModal(),
		} );
	}

	onInit() {
		this.channel = Backbone.Radio.channel( 'ELEMENTOR:finder' );

		this.initLayout();

		this.addShortcut();
	}
}
