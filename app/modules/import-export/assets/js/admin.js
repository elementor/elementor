/**
 * Class Admin
 */
class Admin {
	/**
	 * Session Storage Key
	 *
	 * @type {string}
	 */
	kitReferrerKey = 'elementor-referrer-kit-id';

	/**
	 * Session Storage Key
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

		elementorCommon.dialogsManager.createWidget( 'confirm', {
			headerMessage: __( 'Are you sure?', 'elementor' ),
			message: __( 'Removing ', 'elementor' ) + this.getKitToRemoveName() + __( ' will permanently delete changes made to the Kit\'s content and site settings', 'elementor' ),
			strings: {
				confirm: __( 'Delete', 'elementor' ),
				cancel: __( 'Cancel', 'elementor' ),
			},
			onConfirm: this.onRevertConfirm.bind( this, event.target ),
		} ).show();
	}

	onRevertConfirm( revertBtn ) {
		const referrerKit = new URLSearchParams( revertBtn.href ).get( 'referrer_kit' );

		if ( referrerKit ) {
			sessionStorage.setItem( this.kitReferrerKey, referrerKit );
			sessionStorage.setItem( this.kitNameToRemoveKey, this.getKitToRemoveName() );
		}

		location.href = revertBtn.href;
	}

	/**
	 * MaybeShowKitReferrerDialog
	 */
	maybeShowKitReferrerDialog() {
		const kitReferrerId = sessionStorage.getItem( this.kitReferrerKey );
		if ( ! kitReferrerId ) {
			return;
		}

		const kitRemoved = sessionStorage.getItem( this.kitNameToRemoveKey );
		this.cleanUp();

		elementorCommon.dialogsManager.createWidget( 'confirm', {
			id: 'e-kit-deleted-dialog',
			headerMessage: kitRemoved + __( ' was successfully deleted', 'elementor' ),
			message: __( 'You\'re ready to apply a new Kit! ', 'elementor' ),
			strings: {
				confirm: __( 'Continue to new Kit', 'elementor' ),
				cancel: __( 'Close', 'elementor' ),
			},
			onConfirm: () => {
				location.href = elementorAppConfig.base_url + '#/kit-library/preview/' + kitReferrerId;
			},
		} ).show();
	}

	/**
	 * CleanUp
	 */
	cleanUp() {
		sessionStorage.removeItem( this.kitReferrerKey );
		sessionStorage.removeItem( this.kitNameToRemoveKey );
	}

	/**
	 * Retrieving the last imported kit from the elementorAppConfig global
	 *
	 * @return {string}
	 */
	getKitToRemoveName() {
		if ( this.kitToRemoveName ) {
			return this.kitToRemoveName;
		}

		const lastKit = elementorAppConfig[ 'import-export' ].lastImportedSession;

		if ( lastKit.kit_title ) {
			this.kitToRemoveName = lastKit.kit_title;
		} else if ( lastKit.kit_name ) {
			this.kitToRemoveName = this.convertNameToTitle( lastKit.kit_name );
		} else {
			this.kitToRemoveName = 'Your Kit';
		}

		return this.kitToRemoveName;
	}

	/**
	 * ConvertNameToTitle
	 *
	 * @param {string} name
	 *
	 * @return {string}
	 */
	convertNameToTitle( name ) {
		const words = name.split( /[-_]+/ );
		for ( const key in words ) {
			const word = words[ key ];
			words[ key ] = word[ 0 ].toUpperCase() + word.substring( 1 );
		}
		return words.join( ' ' );
	}
}

new Admin();
