import App from './app';

export default class AiBehavior extends Marionette.Behavior {
	initialize() {
		this.type = 'text';
		this.controlType = 'text';
		this.buttonLabel = __( 'Write with AI', 'elementor' );
		this.isLabelBlock = false;
		this.additionalOptions = {};

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

		ReactDOM.render( <App
			type={ this.getOption( 'type' ) }
			controlType={ this.getOption( 'controlType' ) }
			getControlValue={ this.getOption( 'getControlValue' ) }
			setControlValue={ this.getOption( 'setControlValue' ) }
			additionalOptions={ this.getOption( 'additionalOptions' ) }
			onClose={ () => {
				ReactDOM.unmountComponentAtNode( rootElement );
				rootElement.remove();
			} }
			colorScheme={ colorScheme }
			isRTL={ isRTL }
		/>, rootElement );
	}

	onRender() {
		const isPromotion = ! this.config.is_get_started;
		const buttonLabel = this.getOption( 'buttonLabel' );

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

		this.$el.find( '.elementor-control-title' ).after(
			$button,
		);
	}
}
