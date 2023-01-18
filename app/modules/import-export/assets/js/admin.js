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
	kitToRemoveKey = 'elementor-kit-to-remove-name';

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
			onConfirm: this.onRevertBtnConfirm.bind( this, event.target ),
		} ).show();
	}

	onRevertBtnConfirm( revertBtn ) {
		const referrerKit = new URLSearchParams( revertBtn.href ).get( 'referrer_kit' );

		if ( referrerKit ) {
			sessionStorage.setItem( this.kitReferrerKey, referrerKit );
			sessionStorage.setItem( this.kitToRemoveKey, this.getKitToRemoveName() );
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

		elementorCommon.dialogsManager.createWidget( 'confirm', {
			headerMessage: sessionStorage.getItem( this.kitToRemoveKey ) + __( ' successfully deleted', 'elementor' ),
			message: __( 'You\'re ready to apply a new Kit! ', 'elementor' ),
			strings: {
				confirm: __( 'Continue to new Kit', 'elementor' ),
				cancel: __( 'Close', 'elementor' ),
			},
			onConfirm: () => {
				this.cleanUp();
				location.href = elementorAppConfig.base_url + '#/kit-library/preview/' + kitReferrerId;
			},
			onCancel: () => {
				this.cleanUp();
			},
		} ).show();
	}

	/**
	 * CleanUp
	 */
	cleanUp() {
		sessionStorage.removeItem( this.kitReferrerKey );
		sessionStorage.removeItem( this.kitToRemoveKey );
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

		const appliedKits = elementorAppConfig[ 'import-export' ].importSessions;
		this.kitToRemoveName = appliedKits[ appliedKits.length - 1 ].kit_name;

		return this.kitToRemoveName;
	}
}
new Admin();
