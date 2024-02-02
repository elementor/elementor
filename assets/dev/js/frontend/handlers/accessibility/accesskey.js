export default class AccessKeyHandler extends elementorModules.frontend.handlers.Base {
	__construct( ...args ) {
		super.__construct( ...args );
		this.focusableElementSelector = 'audio, button, canvas, details, iframe, input, select, summary, textarea, video, [accesskey], [contenteditable], [href], [tabindex]:not([tabindex="-1"])';
	}

	onInit( ...args ) {
		super.onInit( ...args );

		this.setAccessKey( null, 'initialization' );
	}

	getDefaultElements() {
		return {
			$focusableContainerElements: this.getFocusableElements( this.$element ),
		};
	}

	getFocusableElements( $elements ) {
		return $elements
			.find( this.focusableElementSelector )
			.not( '[disabled], [inert]' );
	}

	bindEvents() {
		this.elements.$focusableContainerElements.on( 'focus', this.setAccessKey.bind( this ) );
		elementorFrontend.elements.$window.on( 'resize', this.setAccessKey.bind( this ) );
	}

	unbindEvents() {
		this.elements.$focusableContainerElements.off( 'focus', this.setAccessKey.bind( this ) );
		elementorFrontend.elements.$window.off( 'resize', this.setAccessKey.bind( this ) );
	}

	setAccessKey( event, eventType = '' ) {
		if ( ! event && 'initialization' !== eventType ) {
			return false;
		}

		this.resetAccessKeys( eventType );
		this.loopThroughWidgets( event, eventType );
	}

	loopThroughWidgets( event, eventType = '' ) {
		const nextWidgets = this.getNextWidgets( event, eventType );
		let isKeySet = false;
		let loopCount = 0;

		do {
			if ( loopCount === nextWidgets.length ) {
				break;
			}

			const $widget = jQuery( nextWidgets[ loopCount ] ),
				$firstFocusableElement = $widget.find( this.focusableElementSelector ).filter( ':visible' ).first();

			if ( !! $firstFocusableElement ) {
				const accessKeyValue = $firstFocusableElement.attr( 'accesskey' ),
					newAccessKeyValue = !! accessKeyValue && ! accessKeyValue.includes( 'p' )
						? `${ accessKeyValue } p`
						: 'p';

				$firstFocusableElement.attr( 'accesskey', newAccessKeyValue );
				isKeySet = true;
			}

			loopCount++;
		} while ( ! isKeySet );
	}

	getNextWidgets( event, eventType = '' ) {
		const targetElement = 'initialization' === eventType
				? jQuery( 'body' ).find( '.elementor-widget' ).find( this.focusableElementSelector ).filter( ':visible' ).first()[ 0 ]
				: event.currentTarget,
			currentWidget = targetElement.closest( '.elementor-widget' ),
			currentWidgetDataId = currentWidget?.getAttribute( 'data-id' ),
			currentWidgetSelector = `[data-id="${ currentWidgetDataId }"]`,
			widgets = document.querySelectorAll( '.elementor-widget' );

		let isWidgetFound = false;

		return Array.from( widgets ).filter( ( widget ) => {
			const isChildWidget = !! widget.closest( currentWidgetSelector );

			if ( ! isWidgetFound || isChildWidget ) {
				if ( widget === currentWidget ) {
					isWidgetFound = true;
				}

				return false;
			}

			return true;
		} );
	}

	resetAccessKeys( eventType = '' ) {
		const $widget = this.$element;

		$widget.find( '[accesskey]' ).each( ( index, element ) => {
			// eslint-disable-next-line @wordpress/no-global-active-element
			if ( 'initialization' === eventType && document.activeElement === element ) {
				return;
			}

			const accessKeyValue = element.getAttribute( 'accesskey' ),
				rawArray = accessKeyValue.split( ' ' ),
				accessKeyArray = [ ...new Set( rawArray ) ],
				accessKeyIndex = accessKeyArray.indexOf( 'p' );

			if ( -1 !== accessKeyIndex ) {
				const newAccessKeyArray = accessKeyArray.splice( accessKeyIndex, 1 ),
					newAccessKeyValue = accessKeyArray.join( ' ' );

				element.setAttribute( 'accesskey', newAccessKeyValue );
			}
		} );
	}

	onEditSettingsChange() {
		this.setAccessKey();
	}

	onElementChange() {
		this.setAccessKey();
	}
}
