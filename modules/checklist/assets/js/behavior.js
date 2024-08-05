import App from './app';

export default class ChecklistBehavior extends Marionette.Behavior {
	ui() {

		return {
		};
	}

	events() {
		return {
		};
	}

	// onClickControlButtonDisplayConditions( event ) {
	// 	event.stopPropagation();
	// 	this.mount();
	// }
	//
	// onHoverControlButtonDisplayConditions( event ) {
	// 	event.stopPropagation();
	//
	// 	elementor.promotion.showDialog( {
	// 		title: __( 'Display Conditions', 'elementor-pro' ),
	// 		content: __( 'Upgrade to Elementor Pro Advanced to get the Display Conditions feature as well as additional professional and ecommerce widgets', 'elementor-pro' ),
	// 		targetElement: this.el,
	// 		actionButton: {
	// 			url: 'https://go.elementor.com/go-pro-advanced-display-conditions/',
	// 			text: __( 'Upgrade Now', 'elementor-pro' ),
	// 			classes: [ 'elementor-button', 'go-pro' ],
	// 		},
	// 	} );
	// }

	getRootElement() {
		let rootElement = window.parent.document.getElementById( 'e-checklist' );

		if ( !! rootElement ) {
			return rootElement;
		}

		rootElement = document.createElement( 'div' );
		rootElement.setAttribute( 'id', 'e-checklist' );

		return rootElement;
	}

	mount() {
		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto',
			isRTL = elementorCommon.config.isRTL,
			rootElement = this.getRootElement();

		window.parent.document.body.appendChild( rootElement );

		ReactDOM.render( <App // eslint-disable-line react/no-deprecated
			colorScheme={ colorScheme }
			isRTL={ isRTL }
			// getControlValue={ this.getOption( 'getControlValue' ) }
			// setControlValue={ this.getOption( 'setControlValue' ) }
			// fetchData={ this.getOption( 'fetchData' ) }
			// onClose={ () => this.unmount( rootElement ) }
			// conditionsConfig={ this.getOption( 'conditionsConfig' ) }
			// setCacheNoticeStatus={ this.getOption( 'setCacheNoticeStatus' ) }
		/>, rootElement );
	}

	unmount( rootElement ) {
		// eslint-disable-next-line react/no-deprecated
		ReactDOM.unmountComponentAtNode( rootElement );
		rootElement.remove();
	}

	onDocumentLoaded() {

		setTimeout(()=> {
			console.log('app fuck my life 2');
			debugger;
			this.mount()}, 7000)

	}
}
