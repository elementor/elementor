class Admin {
	/**
	 * Session Storage Key
	 *
	 * @type {string}
	 */
	KIT_DATA_KEY = 'elementor-kit-data';

	/**
	 * Contains the ID of the referrer Kit and the name of the Kit to remove. Stored in session storage.
	 *
	 * @type {Object}
	 */
	cachedKitData;

	/**
	 * The 'Remove Kit' revert button
	 *
	 * @type {Element}
	 */
	revertBtn;

	/**
	 * Name of the kit currently active (last imported)
	 *
	 * @type {string}
	 */
	activeKitName;

	constructor() {
		this.activeKitName = this.getActiveKitName();
		this.revertBtn = document.getElementById( 'elementor-import-export__revert_kit' );

		if ( this.revertBtn ) {
			this.revertBtn.addEventListener( 'click', this.revertBtnOnClick.bind( this ) );
			this.maybeAddRevertBtnMargin();
		}

		this.maybeShowReferrerKitDialog();
	}

	/**
	 * Add bottom margin to revert btn if referred from Kit library
	 */
	maybeAddRevertBtnMargin() {
		const referrerKitId = new URLSearchParams( this.revertBtn.href ).get( 'referrer_kit' );
		if ( ! referrerKitId ) {
			return;
		}

		this.revertBtn.style.marginBottom = this.calculateMargin();
		this.scrollToBottom();
	}

	/**
	 * CalculateMargin
	 *
	 * @return {string}
	 */
	calculateMargin() {
		const adminBar = document.getElementById( 'wpadminbar' );
		const adminBarHeight = adminBar ? adminBar.offsetHeight : 0;

		const revertKitHeight = this.revertBtn.parentElement.offsetHeight;

		return (
			document.body.clientHeight -
			adminBarHeight -
			revertKitHeight -
			document.getElementById( 'wpfooter' ).offsetHeight -
			15 // Extra margin at the top
		) + 'px';
	}

	/**
	 * Scroll to the bottom of the page
	 */
	scrollToBottom() {
		setTimeout( () => {
			window.scrollTo( 0, document.body.scrollHeight );
		} );
	}

	/**
	 * RevertBtnOnClick
	 *
	 * @param {Event} event
	 */
	revertBtnOnClick( event ) {
		event.preventDefault();

		elementorCommon.dialogsManager.createWidget( 'confirm', {
			headerMessage: __( 'Are you sure?', 'elementor' ),
			message: __( 'Removing ', 'elementor' ) + this.activeKitName + __( ' will permanently delete changes made to the Kit\'s content and site settings', 'elementor' ),
			strings: {
				confirm: __( 'Delete', 'elementor' ),
				cancel: __( 'Cancel', 'elementor' ),
			},
			onConfirm: this.onRevertConfirm,
		} ).show();
	}

	onRevertConfirm() {
		const referrerKitId = new URLSearchParams( this.revertBtn.href ).get( 'referrer_kit' );

		this.saveToCache( referrerKitId ?? '' );

		location.href = this.revertBtn.href;
	}

	maybeShowReferrerKitDialog() {
		const { referrerKitId } = this.getDataFromCache();
		if ( undefined === referrerKitId ) {
			return;
		}

		if ( 0 === referrerKitId.length ) {
			this.createKitDeletedWidget( {
				message: __( 'Try a different Kit or build your site from scratch.', 'elementor' ),
				strings: {
					confirm: __( 'OK', 'elementor' ),
					cancel: __( 'Kit Library', 'elementor' ),
				},
				onCancel: () => {
					location.href = elementorAppConfig[ 'kit-library' ].app_url;
				},
			} );
			this.clearCache();

			return;
		}

		this.createKitDeletedWidget( {
			message: __( 'You\'re ready to apply a new Kit!', 'elementor' ),
			strings: {
				confirm: __( 'Continue to new Kit', 'elementor' ),
				cancel: __( 'Close', 'elementor' ),
			},
			onConfirm: () => {
				location.href = elementorAppConfig[ 'kit-library' ].app_url + '/preview/' + referrerKitId;
			},
		} );
		this.clearCache();
	}

	/**
	 * CreateKitDeletedWidget
	 *
	 * @param {Object} options
	 */
	createKitDeletedWidget( options ) {
		const { activeKitName } = this.getDataFromCache();

		elementorCommon.dialogsManager.createWidget( 'confirm', {
			id: 'e-revert-kit-deleted-dialog',
			headerMessage: activeKitName + __( ' was successfully deleted', 'elementor' ),
			message: options.message,
			strings: {
				confirm: options.strings.confirm,
				cancel: options.strings.cancel,
			},
			onConfirm: options.onConfirm,
			onCancel: options.onCancel,
		} ).show();
	}

	/**
	 * Retrieving the last imported kit from the elementorAppConfig global
	 *
	 * @return {string}
	 */
	getActiveKitName() {
		const lastKit = elementorAppConfig[ 'import-export' ].lastImportedSession;

		if ( lastKit.kit_title ) {
			return lastKit.kit_title;
		}

		if ( lastKit.kit_name ) {
			return this.convertNameToTitle( lastKit.kit_name );
		}

		return __( 'Your Kit', 'elementor' );
	}

	/**
	 * ConvertNameToTitle
	 *
	 * @param {string} name
	 *
	 * @return {string}
	 */
	convertNameToTitle( name ) {
		return name
			.split( /[-_]+/ )
			.map( ( word ) => word[ 0 ].toUpperCase() + word.substring( 1 ) )
			.join( ' ' );
	}

	saveToCache( referrerKitId ) {
		sessionStorage.setItem(
			this.KIT_DATA_KEY,
			JSON.stringify( {
				referrerKitId,
				activeKitName: this.activeKitName
			} )
		);
	}

	getDataFromCache() {
		if ( this.cachedKitData ) {
			return this.cachedKitData;
		}

		try {
			this.cachedKitData = JSON.parse( sessionStorage.getItem( this.KIT_DATA_KEY ) );
		} catch ( e ) {
			return {};
		}

		return this.cachedKitData ?? {};
	}

	clearCache() {
		sessionStorage.removeItem( this.KIT_DATA_KEY );
	}
}

window.addEventListener( 'load', () => {
	new Admin();
} );
