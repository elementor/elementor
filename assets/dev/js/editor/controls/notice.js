var ControlBaseView = require( 'elementor-controls/base' );

module.exports = ControlBaseView.extend( {

	ui() {
		const ui = ControlBaseView.prototype.ui.apply( this, arguments );

		ui.button = '.elementor-control-notice-dismiss';

		return ui;
	},

	events: {
		'click @ui.button': 'onDismissButtonClick',
	},

	getDismissId() {
		const controlName = this.model.get( 'name' );
		const elementType = 'widget' === this.options?.element?.model?.attributes?.elType
			? this.options?.element?.model?.attributes?.widgetType
			: this.options?.element?.model?.attributes?.elType;

		return `${ elementType }-${ controlName }`;
	},

	onDismissButtonClick() {
		const dismissId = this.getDismissId();

		this.$el.remove();

		elementorCommon.ajax.addRequest( 'dismissed_editor_notices', {
			data: {
				dismissId,
			},
		} );
	},

	templateHelpers() {
		const controlData = ControlBaseView.prototype.templateHelpers.apply( this, arguments );
		const dismissId = this.getDismissId();

		controlData.data.shouldRenderControl = ! ( elementor.config.user?.dismissed_editor_notices && true === elementor.config.user?.dismissed_editor_notices[ dismissId ] );

		return controlData;
	},
} );
