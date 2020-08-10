module.exports = elementorModules.Module.extend( {
	initToast: function() {
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
				show: function() {
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
						top: top,
					}, {
						easing: 'linear',
						duration: 300,
					} );
				},
				hide: function() {
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

	showToast: function( options ) {
		var toast = this.getToast();

		toast.setMessage( options.message );

		toast.getElements( 'buttonsWrapper' ).empty();

		if ( options.buttons ) {
			options.buttons.forEach( function( button ) {
				toast.addButton( button );
			} );
		} else {
			toast.getElements( 'buttonsWrapper' ).remove();
		}

		if ( options.classes ) {
			toast.getElements( 'widget' ).addClass( options.classes );
		}

		toast.show();
	},

	onInit: function() {
		this.initToast();
	},
} );
