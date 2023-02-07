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

	constructor() {
		this.configureRevertBtn();
		this.maybeShowReferrerKitDialog();
	}

	configureRevertBtn() {
		const revertButton = document.getElementById( 'elementor-import-export__revert_kit' );
		if ( ! revertButton ) {
			return;
		}
		revertButton.addEventListener( 'click', this.revertBtnOnClick.bind( this ) );
		this.maybeAddRevertBtnMargin( revertButton );
	}

	/**
	 * MaybeAddRevertBtnMargin
	 *
	 * @param {HTMLAnchorElement} revertButton
	 */
	maybeAddRevertBtnMargin( revertButton ) {
		const referrerKitId = new URLSearchParams( revertButton.href ).get( 'referrer_kit' );
		if ( ! referrerKitId ) {
			return;
		}
		revertButton.style.marginBottom = this.calculateMargin( revertButton );
		this.scrollToBottom();
	}

	/**
	 * CalculateMargin
	 *
	 * @param {HTMLAnchorElement} revertButton
	 *
	 * @return {string}
	 */
	calculateMargin( revertButton ) {
		const adminBar = document.getElementById( 'wpadminbar' );
		const adminBarHeight = adminBar ? adminBar.offsetHeight : 0;

		const revertKitHeight = revertButton.parentElement.offsetHeight;

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

		const kitNameToRemove = this.getKitNameToRemove();

		elementorCommon.dialogsManager.createWidget( 'confirm', {
			headerMessage: __( 'Are you sure?', 'elementor' ),
			message: __( 'Removing ', 'elementor' ) + kitNameToRemove + __( ' will permanently delete changes made to the Kit\'s content and site settings', 'elementor' ),
			strings: {
				confirm: __( 'Delete', 'elementor' ),
				cancel: __( 'Cancel', 'elementor' ),
			},
			onConfirm: () => this.onRevertConfirm( event.target, kitNameToRemove ),
		} ).show();
	}

	onRevertConfirm( revertBtn, kitNameToRemove ) {
		const referrerKitId = new URLSearchParams( revertBtn.href ).get( 'referrer_kit' );

		this.saveToCache( referrerKitId ?? '', kitNameToRemove );

		location.href = revertBtn.href;
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
					location.href = elementorAppConfig.base_url + '#/kit-library';
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
				location.href = elementorAppConfig.base_url + '#/kit-library/preview/' + referrerKitId;
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
		const { kitNameToRemove } = this.getDataFromCache();

		elementorCommon.dialogsManager.createWidget( 'confirm', {
			id: 'e-revert-kit-deleted-dialog',
			headerMessage: kitNameToRemove + __( ' was successfully deleted', 'elementor' ),
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
	getKitNameToRemove() {
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

	saveToCache( referrerKitId, kitNameToRemove ) {
		sessionStorage.setItem( this.KIT_DATA_KEY, JSON.stringify( { referrerKitId, kitNameToRemove } ) );
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
