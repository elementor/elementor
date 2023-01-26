/**
 * Class Admin
 */
class Admin {
	/**
	 * Session Storage Key
	 * Is the user referred from a Kit in the Kit library
	 *
	 * @type {string}
	 */
	isKitReferredKey = 'elementor-is-kit-referred';

	/**
	 * Session Storage Key
	 * Identifier of the kit that referred the user from the Kit library
	 *
	 * @type {string}
	 */
	kitReferrerKey = 'elementor-referrer-kit-id';

	/**
	 * Session Storage Key
	 * Name of the last imported Kit that it to be or was removed
	 *
	 * @type {string}
	 */
	kitNameToRemoveKey = 'elementor-kit-to-remove-name';

	/**
	 * Constructor
	 */
	constructor() {
		this.addRevertBtnListener();
		this.maybeShowKitReferrerDialog();
	}

	/**
	 * AddRevertBtnListener
	 */
	addRevertBtnListener() {
		const revertButton = document.getElementById( 'elementor-import-export__revert_kit' );
		if ( ! revertButton ) {
			return;
		}

		revertButton.addEventListener( 'click', this.revertBtnOnClick.bind( this ) );
	}

	/**
	 * RevertBtnOnClick
	 *
	 * @param {Event} event
	 */
	revertBtnOnClick( event ) {
		event.preventDefault();

		const kitNameToRemove = this.getKitToRemoveName();

		elementorCommon.dialogsManager.createWidget( 'confirm', {
			headerMessage: __( 'Are you sure?', 'elementor' ),
			message: __( 'Removing ', 'elementor' ) + kitNameToRemove + __( ' will permanently delete changes made to the Kit\'s content and site settings', 'elementor' ),
			strings: {
				confirm: __( 'Delete', 'elementor' ),
				cancel: __( 'Cancel', 'elementor' ),
			},
			onConfirm: this.onRevertConfirm.bind( this, event.target, kitNameToRemove ),
		} ).show();
	}

	onRevertConfirm( revertBtn, kitNameToRemove ) {
		const referrerKit = new URLSearchParams( revertBtn.href ).get( 'referrer_kit' );

		this.setSessionStorage( Boolean( referrerKit ), referrerKit, kitNameToRemove );

		location.href = revertBtn.href;
	}

	setSessionStorage( referred, referrerKit, kitNameToRemove ) {
		sessionStorage.setItem( this.isKitReferredKey, referred ? 'yes' : 'no' );
		if ( referred ) {
			sessionStorage.setItem( this.kitReferrerKey, referrerKit );
		}
		sessionStorage.setItem( this.kitNameToRemoveKey, kitNameToRemove );
	}

	/**
	 * MaybeShowKitReferrerDialog
	 */
	maybeShowKitReferrerDialog() {
		const isKitReferred = sessionStorage.getItem( this.isKitReferredKey );
		if ( ! isKitReferred ) {
			return;
		}

		if ( 'no' === isKitReferred ) {
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
			this.cleanUp( false );

			return;
		}

		const kitReferrerId = sessionStorage.getItem( this.kitReferrerKey );
		this.createKitDeletedWidget( {
			message: __( 'You\'re ready to apply a new Kit!', 'elementor' ),
			strings: {
				confirm: __( 'Continue to new Kit', 'elementor' ),
				cancel: __( 'Close', 'elementor' ),
			},
			onConfirm: () => {
				location.href = elementorAppConfig.base_url + '#/kit-library/preview/' + kitReferrerId;
			},
		} );
		this.cleanUp( true );
	}

	/**
	 * CreateKitDeletedWidget
	 *
	 * @param {Object} options
	 */
	createKitDeletedWidget( options ) {
		elementorCommon.dialogsManager.createWidget( 'confirm', {
			id: 'e-revert-kit-deleted-dialog',
			headerMessage: sessionStorage.getItem( this.kitNameToRemoveKey ) + __( ' was successfully deleted', 'elementor' ),
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
	 * CleanUp
	 *
	 * @param {boolean} referred
	 */
	cleanUp( referred ) {
		sessionStorage.removeItem( this.isKitReferredKey );
		if ( referred ) {
			sessionStorage.removeItem( this.kitReferrerKey );
		}
		sessionStorage.removeItem( this.kitNameToRemoveKey );
	}

	/**
	 * Retrieving the last imported kit from the elementorAppConfig global
	 *
	 * @return {string}
	 */
	getKitToRemoveName() {
		const lastKit = elementorAppConfig[ 'import-export' ].lastImportedSession;

		if ( lastKit?.kit_title ) {
			return lastKit.kit_title;
		}

		if ( lastKit?.kit_name ) {
			return this.convertNameToTitle( lastKit.kit_name );
		}

		return 'Your Kit';
	}

	/**
	 * ConvertNameToTitle
	 *
	 * @param {string} name
	 *
	 * @return {string}
	 */
	convertNameToTitle( name ) {
		const words = name.split( /[-_]+/ ).map( ( word ) => word[ 0 ].toUpperCase() + word.substring( 1 ) );
		return words.join( ' ' );
	}
}

new Admin();
