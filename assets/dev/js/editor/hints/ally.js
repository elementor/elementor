class Ally extends elementorModules.editor.utils.Module {
	eventName = 'ally_heading_notice';
	suffix = '';
	control = null;
	onSectionActive( sectionName ) {
		// Check if the section is the section_title of heading widget
		if ( ! [ 'section_title' ].includes( sectionName ) ) {
			return;
		}

		this.control = null;

		// Check if control exists
		if ( ! this.hasPromoControl() ) {
			return;
		}

		// Check if the user has dismissed the hint
		if ( elementor.config.user.dismissed_editor_notices.includes( 'ally_heading_notice' ) ) {
			this.getPromoControl().remove();
			return;
		}

		this.registerEvents();
	}

	registerEvents() {
		// Handle dismiss and action buttons
		const dismissBtn = this.getPromoControl().$el.find( '.elementor-control-notice-dismiss' );
		const onDismissBtnClick = ( event ) => {
			dismissBtn.off( 'click', onDismissBtnClick ); // Remove the event listener
			event.preventDefault();
			this.dismiss();
			this.getPromoControl().remove();
		};
		dismissBtn.on( 'click', onDismissBtnClick );

		// Handle action button
		const actionBtn = this.getPromoControl().$el.find( '.e-btn-1' );
		const onActionBtn = ( event ) => {
			actionBtn.off( 'click', onActionBtn ); // Remove the event listener
			event.preventDefault();
			this.onAction( event );
			this.getPromoControl().remove();
		};
		actionBtn.on( 'click', onActionBtn );
	}

	getPromoControl() {
		if ( ! this.control ) {
			this.control = this.getEditorControlView( 'ally_heading_notice' );
		}
		return this.control;
	}

	hasPromoControl() {
		return !! this.getPromoControl();
	}

	ajaxRequest( name, data ) {
		elementorCommon.ajax.addRequest( name, {
			data,
		} );
	}

	dismiss() {
		this.ajaxRequest( 'dismissed_editor_notices', {
			dismissId: this.eventName,
		} );

		// Prevent opening the same hint again in current editor session.
		this.ensureNoPromoControlInSession();
	}

	ensureNoPromoControlInSession() {
		// Prevent opening the same hint again in current editor session.
		elementor.config.user.dismissed_editor_notices.push( this.eventName );
	}

	onAction( event ) {
		const { action_url: actionURL = null } = JSON.parse( event.target.closest( 'button' ).dataset.settings );
		if ( actionURL ) {
			window.open( actionURL, '_blank' );
		}

		this.ensureNoPromoControlInSession();
	}

	onElementorLoaded() {
		elementor.channels.editor.on( 'section:activated', this.onSectionActive.bind( this ) );
	}
}

export default Ally;
