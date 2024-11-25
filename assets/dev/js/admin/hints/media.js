( function() {
	if ( ! elementorAdminHints?.mediaHint ) {
		return;
	}
	if ( ! wp?.media?.view?.Attachment?.Details ) {
		return;
	}

	wp.media.view.Attachment.Details = wp.media.view.Attachment.Details.extend( {
		_tmpl: `<div class="e-hint__container" style="clear:both" data-event="<%= dismissible %>">
		<div class="elementor-control-notice elementor-control-notice-type-<%= type %>" data-display="<%= display %>">
			<div class="elementor-control-notice-icon">
				<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M2.25 9H3M9 2.25V3M15 9H15.75M4.2 4.2L4.725 4.725M13.8 4.2L13.275 4.725M7.27496 12.75H10.725M6.75 12C6.12035 11.5278 5.65525 10.8694 5.42057 10.1181C5.1859 9.36687 5.19355 8.56082 5.44244 7.81415C5.69133 7.06748 6.16884 6.41804 6.80734 5.95784C7.44583 5.49764 8.21294 5.25 9 5.25C9.78706 5.25 10.5542 5.49764 11.1927 5.95784C11.8312 6.41804 12.3087 7.06748 12.5576 7.81415C12.8065 8.56082 12.8141 9.36687 12.5794 10.1181C12.3448 10.8694 11.8796 11.5278 11.25 12C10.9572 12.2899 10.7367 12.6446 10.6064 13.0355C10.4761 13.4264 10.4397 13.8424 10.5 14.25C10.5 14.6478 10.342 15.0294 10.0607 15.3107C9.77936 15.592 9.39782 15.75 9 15.75C8.60218 15.75 8.22064 15.592 7.93934 15.3107C7.65804 15.0294 7.5 14.6478 7.5 14.25C7.56034 13.8424 7.52389 13.4264 7.3936 13.0355C7.2633 12.6446 7.04282 12.2899 6.75 12Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path>
				</svg>
			</div>
			<div class="elementor-control-notice-main action-handler" data-event="<%= button_event %>" data-settings="<%= button_data %>">
				<div class="elementor-control-notice-main-content"><%= content %></div>
				<div class="elementor-control-notice-main-actions">
				<% if ( typeof(button_text) !== "undefined" ) { %>
					<button class="e-btn e-<%= type %> e-btn-1">
						<%= button_text %>
					</button>
				<% } %>
				</div>
			</div>
			<button class="elementor-control-notice-dismiss" data-event="<%= dismissible %>" aria-label="<%= dismiss %>">
				<i class="eicon eicon-close" aria-hidden="true"></i>
			</button>
		</div>
	</div>`,
		template( view ) {
			// Get the template and parse it
			const html = wp.media.template( 'attachment-details' )( view ); // The template to extend
			const dom = document.createElement( 'div' );
			dom.innerHTML = html;

			if ( ! this.shouldDisplayHint( view ) ) {
				return dom.innerHTML;
			}

			const hint = document.createElement( 'div' ); // Create a new element
			hint.classList.add( 'e-hint' ); // Add a class to the element for styling
			hint.innerHTML = _.template( this._tmpl )( elementorAdminHints.mediaHint ); // Add the content to the new element

			// Insert the new element at the correct spot
			const details = dom.querySelector( '.attachment-info' );
			details.appendChild( hint ); // Add new element at the correct spot

			return dom.innerHTML;
		},

		events: {
			...wp.media.view.Attachment.Details.prototype.events,
			'click .elementor-control-notice-dismiss': 'dismiss',
			'click .e-hint__container a': 'onHintAnchorClick',
			'click .e-hint__container button.e-btn-1': 'onHintAction',
		},

		shouldDisplayHint( view ) {
			if ( ! elementorAdminHints || ! elementorAdminHints?.mediaHint ) {
				return false;
			}
			if ( window.elementorHints !== undefined ) {
				return false;
			}
			if ( view.type !== 'image' ) {
				return false;
			}
			if ( elementorAdminHints.mediaHint.display ) {
				return true;
			}
			return this.imageNotOptimized( view );
		},

		imageNotOptimized( attachment ) {
			const checks = {
				height: 1080,
				width: 1920,
				filesizeInBytes: 100000,
			};

			return Object.keys( checks ).some( ( key ) => {
				const value = attachment[ key ] || false;
				return value && value > checks[ key ];
			} );
		},

		onHintAction( event ) {
			event.preventDefault();
			const b64Settings = event.target.closest( '.action-handler' ).dataset.settings;
			const settings = atob( b64Settings );
			const { action_url: actionURL = null } = JSON.parse( settings );
			if ( actionURL ) {
				window.open( actionURL, '_blank' );
			}
			this.dismiss( event );
		},

		onHintAnchorClick( event ) {
			this.dismiss( event );
		},

		dismiss( event ) {
			elementorCommon.ajax.addRequest( 'dismissed_editor_notices', {
				data: {
					dismissId: event.target.closest( '.e-hint__container' ).dataset.event,
				},
			} );

			this.hideHint( event );
		},

		hideHint( event ) {
			event.target.closest( '.e-hint__container' ).remove();
			window.elementorHints = {};
		},
	} );
} )();
