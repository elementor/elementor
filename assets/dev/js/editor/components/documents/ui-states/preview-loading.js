import UiStateBase from 'elementor-api/core/states/ui-state-base';

export class PreviewLoading extends UiStateBase {
	static ON = 'on';

	timeout = 600;

	getId() {
		return 'preview-loading';
	}

	getOptions() {
		return {
			[ this.constructor.ON ]: '',
		};
	}

	onChange( oldValue, newValue ) {
		if ( this.constructor.ON === newValue ) {
			jQuery( '#elementor-preview-loading' ).show();
		} else {
			jQuery( '#elementor-preview-loading' ).fadeOut( this.timeout );
		}
	}
}

export default PreviewLoading;
