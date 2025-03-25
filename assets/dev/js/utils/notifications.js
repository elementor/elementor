module.exports = elementorModules.Module.extend( {
	initToast() {
		var toast = elementorCommon.dialogsManager.createWidget( 'buttons', {
			id: 'elementor-toast',
			position: {
				my: 'center bottom',
				at: 'center bottom-10',
				of: '#elementor-panel-content-wrapper',
				autoRefresh: true,
			},
			hide: {
				onClick: true,
				auto: true,
				autoDelay: 10000,
			},
			effects: {
				show() {
					var $widget = toast.getElements( 'widget' );

					$widget.show();

					toast.refreshPosition();

					var top = parseInt( $widget.css( 'top' ), 10 );

					$widget
						.hide()
						.css( 'top', top + 100 );

					$widget.animate( {
						opacity: 'show',
						height: 'show',
						paddingBottom: 'show',
						paddingTop: 'show',
						top,
					}, {
						easing: 'linear',
						duration: 300,
					} );
				},
				hide() {
					var $widget = toast.getElements( 'widget' ),
						top = parseInt( $widget.css( 'top' ), 10 );

					$widget.animate( {
						opacity: 'hide',
						height: 'hide',
						paddingBottom: 'hide',
						paddingTop: 'hide',
						top: top + 100,
					}, {
						easing: 'linear',
						duration: 300,
					} );
				},
			},
			button: {
				tag: 'div',
			},
		} );

		this.getToast = function() {
			return toast;
		};
	},

	showToast( options ) {
		var toast = this.getToast();

		toast.setMessage( options.message );

		toast.getElements( 'buttonsWrapper' ).empty();

		if ( ! this.isPositionValid( options?.position ) ) {
			this.positionToWindow();
		}

		if ( options.buttons ) {
			options.buttons.forEach( function( button ) {
				toast.addButton( button );
			} );
		}

		if ( options.classes ) {
			toast.getElements( 'widget' ).addClass( options.classes );
		}

		if ( options.sticky ) {
			toast.setSettings( {
				hide: {
					auto: false,
					onClick: false,
				},
			} );
		}

		return toast.show();
	},

	isPositionValid( position ) {
		const positionToCheck = position?.of ?? this.getToast().getSettings( 'position' ).of;

		if ( ! positionToCheck ) {
			return false;
		}

		return !! document.querySelector( positionToCheck );
	},

	positionToWindow() {
		const toast = this.getToast();

		const position = {
			...toast.getSettings( 'position' ),
			my: 'right top',
			at: 'right-10 top+42', // 42px is the default admin bar height + 10px
			of: '',
		};

		toast.setSettings( 'position', position );
		toast.getElements( 'widget' ).addClass( 'dialog-position-window' );
	},

	onInit() {
		this.initToast();
	},
} );
