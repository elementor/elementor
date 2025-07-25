module.exports = Marionette.LayoutView.extend( {
	template: '#tmpl-elementor-sidebar',

	id: 'elementor-sidebar-inner',

	ui: {
		buttons: 'button.tooltip-target',
	},

	onRender() {
		this.addTooltip();
	},

	addTooltip() {
		if ( ! this.ui.buttons?.length ) {
			return;
		}

		this.ui.buttons.tipsy( {
			gravity() {
				var gravity = jQuery( this ).data( 'tooltip-pos' );

				if ( undefined !== gravity ) {
					return gravity;
				}

				return elementorCommon.config.isRTL ? 'e' : 'w';
			},
			title() {
				return this.getAttribute( 'data-tooltip' );
			},
		} );
	},
} );
