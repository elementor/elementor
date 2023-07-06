import App from './app';

export default class AiBehavior extends Marionette.Behavior {
	initialize() {
		this.type = 'text';
		this.controlType = 'text';
		this.buttonLabel = __( 'Write with AI', 'elementor' );
		this.editButtonLabel = __( 'Edit with AI', 'elementor' );
		this.isLabelBlock = false;
		this.additionalOptions = {};
		this.context = {};

		this.config = window.ElementorAiConfig;
	}

	ui() {
		return {
			aiButton: '.e-ai-button',
		};
	}

	events() {
		return {
			'click @ui.aiButton': 'onAiButtonClick',
		};
	}

	onAiButtonClick( event ) {
		event.stopPropagation();

		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';

		const isRTL = elementorCommon.config.isRTL;

		const rootElement = document.createElement( 'div' );
		document.body.append( rootElement );

		window.elementorAiCurrentContext = this.getOption( 'context' );

		ReactDOM.render( <App
			type={ this.getOption( 'type' ) }
			controlType={ this.getOption( 'controlType' ) }
			getControlValue={ this.getOption( 'getControlValue' ) }
			setControlValue={ this.getOption( 'setControlValue' ) }
			additionalOptions={ this.getOption( 'additionalOptions' ) }
			controlView={ this.getOption( 'controlView' ) }
			onClose={ () => {
				ReactDOM.unmountComponentAtNode( rootElement );
				rootElement.remove();
			} }
			colorScheme={ colorScheme }
			isRTL={ isRTL }
		/>, rootElement );
	}

	getAiButtonLabel() {
		const defaultValue = this.getOption( 'additionalOptions' )?.defaultValue;
		const currentValue = this.getOption( 'getControlValue' )();
		const isMedia = 'media' === this.getOption( 'type' );
		const isDefaultValue = ( ! isMedia && defaultValue === currentValue ) || ( isMedia && currentValue?.url === defaultValue?.url );

		return isDefaultValue ? this.getOption( 'buttonLabel' ) : this.getOption( 'editButtonLabel' );
	}

	onRender() {
		const isPromotion = ! this.config.is_get_started;
		const buttonLabel = this.getAiButtonLabel();

		const $button = jQuery( '<button>', {
			class: 'e-ai-button',
		} );

		if ( ! isPromotion ) {
			$button.addClass( 'e-active' );
		}

		$button.html( '<i class="eicon-ai"></i>' );

		if ( this.getOption( 'isLabelBlock' ) && isPromotion ) {
			$button.append( ' ' + buttonLabel );
		} else {
			$button.tipsy( {
				gravity: 's',
				title() {
					return buttonLabel;
				},
			} );
		}

		let $wrap = this.$el.find( '.elementor-control-responsive-switchers' );
		if ( ! $wrap.length ) {
			$wrap = this.$el.find( '.elementor-control-title' );
		}

		$wrap.after(
			$button,
		);
	}
}
