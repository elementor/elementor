const BaseMultiple = require( 'elementor-controls/base-multiple' );

class URL extends BaseMultiple {
	ui() {
		const ui = super.ui();

		ui.mainInput = '.elementor-input';
		ui.moreOptionsToggle = '.elementor-control-url-more';
		ui.moreOptions = '.elementor-control-url-more-options';

		return ui;
	}

	events() {
		const events = super.events();

		events[ 'click @ui.moreOptionsToggle' ] = 'onMoreOptionsToggleClick';

		return events;
	}

	autoComplete() {
		const $mainInput = this.ui.mainInput,
			positionBase = elementorCommon.config.isRTL ? 'right' : 'left';

		let last, cache;

		// Based on /wp-includes/js/tinymce/plugins/wplink/plugin.js.
		$mainInput.autocomplete( {
			source: ( request, response ) => {
				if ( ! this.options.model.attributes.autocomplete ) {
					return;
				}

				if ( last === request.term ) {
					response( cache );
					return;
				}

				if ( /^https?:/.test( request.term ) || request.term.indexOf( '.' ) !== -1 ) {
					return response();
				}

				// Show Spinner.
				$mainInput.prev().show();

				jQuery.post( window.ajaxurl, {
					editor: 'elementor',
					action: 'wp-link-ajax',
					page: 1,
					search: request.term,
					_ajax_linking_nonce: jQuery( '#_ajax_linking_nonce' ).val(),
				}, ( data ) => {
					cache = data;
					response( data );
				}, 'json' )
					.always( () => $mainInput.prev().hide() );

				last = request.term;
			},
			focus: ( event ) => {
				/*
				 * Don't empty the URL input field, when using the arrow keys to
				 * highlight items. See api.jqueryui.com/autocomplete/#event-focus
				 */
				event.preventDefault();
			},
			select: ( event, ui ) => {
				$mainInput.val( ui.item.permalink );

				this.setValue( 'url', ui.item.permalink );

				return false;
			},
			open: ( event ) => {
				jQuery( event.target ).data( 'uiAutocomplete' ).menu.activeMenu.addClass( 'elementor-autocomplete-menu' );
			},
			minLength: 2,
			position: {
				my: positionBase + ' top+2',
				at: positionBase + ' bottom',
			},
		} );

		// The `_renderItem` cannot be override via the arguments.
		$mainInput.autocomplete( 'instance' )._renderItem = ( ul, item ) => {
			const fallbackTitle = window.wpLinkL10n ? window.wpLinkL10n.noTitle : '',
				title = item.title ? item.title : fallbackTitle;

			return jQuery( '<li role="option" id="mce-wp-autocomplete-' + item.ID + '">' )
				.append( '<span>' + title + '</span>&nbsp;<span class="elementor-autocomplete-item-info">' + item.info + '</span>' )
				.appendTo( ul );
		};
	}

	onReady() {
		this.autoComplete();
	}

	onMoreOptionsToggleClick() {
		this.ui.moreOptions.slideToggle();
	}

	onBeforeDestroy() {
		if ( this.ui.mainInput.data( 'autocomplete' ) ) {
			this.ui.mainInput.autocomplete( 'destroy' );
		}

		this.$el.remove();
	}
}

module.exports = URL;
