export class ScrollToView extends $e.modules.editor.CommandContainerInternalBase {
	validateArgs( args = {} ) {
		// Support containers.
		if ( args.container ) {
			this.requireContainer();
			args.$element = args.container.view.$el;
		}

		this.requireArgumentInstance( '$element', jQuery );
	}

	apply( args = {} ) {
		const { $element, $parent, timeout } = args;

		this.scrollToView( $element, timeout, $parent );
	}

	scrollToView( $element, timeout, $parent ) {
		if ( undefined === timeout ) {
			timeout = 500;
		}

		let $scrolled = $parent;
		const $elementorFrontendWindow = elementorFrontend.elements.$window;

		if ( ! $parent ) {
			$parent = $elementorFrontendWindow;

			$scrolled = elementor.$previewContents.find( 'html, body' );
		}

		setTimeout( function() {
			// Sometimes element removed during the timeout.
			if ( ! $element[ 0 ].isConnected ) {
				return;
			}

			const parentHeight = $parent.height(),
				parentScrollTop = $parent.scrollTop(),
				elementTop = $parent === $elementorFrontendWindow ? $element.offset().top : $element[ 0 ].offsetTop,
				topToCheck = elementTop - parentScrollTop;

			if ( topToCheck > 0 && topToCheck < parentHeight ) {
				return;
			}

			const scrolling = elementTop - ( parentHeight / 2 );

			$scrolled.stop( true ).animate( { scrollTop: scrolling }, 1000 );
		}, timeout );
	}
}

export default ScrollToView;
