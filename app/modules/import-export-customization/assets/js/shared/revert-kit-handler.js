import { apiRequest } from './utils/api-request';

export class RevertKitHandler {
	static API_PATH = 'revert';
	static DIALOG_ID = 'e-revert-kit-deleted-dialog';
	static URL_PARAM_REFERRER_KIT = 'referrer_kit';
	static SESSION_ID_KEY = 'session_id';
	static CACHE_KEYS = {
		REFERRER_KIT_ID: 'referrerKitId',
		ACTIVE_KIT_NAME: 'activeKitName',
	};
	static KIT_DATA_KEY = 'elementor-kit-data';
	static NAME_SEPARATOR_PATTERN = /[-_]+/;

	constructor( { revertButton, onSuccess, onError } = {} ) {
		this.revertButton = revertButton;
		this.onSuccess = onSuccess || this.defaultSuccessHandler.bind( this );
		this.onError = onError || this.defaultErrorHandler.bind( this );
	}

	async revertKit() {
		const activeKitName = this.getActiveKitName();
		const confirmed = await this.showConfirmationDialog( activeKitName );

		if ( ! confirmed ) {
			return;
		}

		try {
			const referrerKitId = this.getReferrerKitId();
			this.saveToCache( referrerKitId, activeKitName );

			const response = await this.callRevertAPI();
			this.handleRevertResponse( response );
			this.onSuccess( response );
		} catch ( error ) {
			this.onError( error );
		}
	}

	async callRevertAPI() {
		const result = await apiRequest( {
			path: RevertKitHandler.API_PATH,
		} );

		return result;
	}

	handleRevertResponse( response ) {
		if ( ! response.revert_completed ) {
			this.handleRevertNoSessions( response );
			return;
		}

		this.showRevertCompletedDialog( response );
	}

	showRevertCompletedDialog( response ) {
		const shouldShowReferrerDialog = response.show_referrer_dialog && response.referrer_kit_id;

		if ( shouldShowReferrerDialog ) {
			this.showReferrerKitDialog( response.referrer_kit_id );
			return;
		}

		this.showRevertSuccessDialog();
	}

	handleRevertNoSessions( response ) {
		elementorCommon.dialogsManager
			.createWidget( 'alert', {
				message:
					response.message ||
					__( 'No import sessions available to revert.', 'elementor' ),
			} )
			.show();
	}

	async showConfirmationDialog( activeKitName ) {
		return new Promise( ( resolve ) => {
			elementorCommon.dialogsManager
				.createWidget( 'confirm', {
					headerMessage: __( 'Are you sure?', 'elementor' ),
					/* Translators: %s: Kit name */
					message: __(
						"Removing %s will permanently delete changes made to the Websites Template's content and site settings",
						'elementor',
					).replace( '%s', activeKitName ),
					strings: {
						confirm: __( 'Delete', 'elementor' ),
						cancel: __( 'Cancel', 'elementor' ),
					},
					onConfirm: () => resolve( true ),
					onCancel: () => resolve( false ),
				} )
				.show();
		} );
	}

	showRevertSuccessDialog() {
		const { [ RevertKitHandler.CACHE_KEYS.ACTIVE_KIT_NAME ]: activeKitName } =
			this.getDataFromCache();

		elementorCommon.dialogsManager
			.createWidget( 'confirm', {
				id: RevertKitHandler.DIALOG_ID,
				/* Translators: %s: Kit name */
				headerMessage: __( '%s was successfully deleted', 'elementor' ).replace(
					'%s',
					activeKitName,
				),
				message: __(
					'Try a different Website Template or build your site from scratch.',
					'elementor',
				),
				strings: {
					confirm: __( 'OK', 'elementor' ),
					cancel: __( 'Library', 'elementor' ),
				},
				onCancel: () => {
					location.href = elementorImportExport.appUrl;
				},
			} )
			.show();

		this.clearCache();
	}

	showReferrerKitDialog( referrerKitId ) {
		const { [ RevertKitHandler.CACHE_KEYS.ACTIVE_KIT_NAME ]: activeKitName } =
			this.getDataFromCache();

		elementorCommon.dialogsManager
			.createWidget( 'confirm', {
				id: RevertKitHandler.DIALOG_ID,
				/* Translators: %s: Kit name */
				headerMessage: __( '%s was successfully deleted', 'elementor' ).replace(
					'%s',
					activeKitName,
				),
				message: __( "You're ready to apply a new Kit!", 'elementor' ),
				strings: {
					confirm: __( 'Continue to new Kit', 'elementor' ),
					cancel: __( 'Close', 'elementor' ),
				},
				onConfirm: () => {
					location.href =
						elementorImportExport.appUrl + '/preview/' + referrerKitId;
				},
			} )
			.show();

		this.clearCache();
	}

	maybeShowReferrerKitDialog() {
		const { [ RevertKitHandler.CACHE_KEYS.REFERRER_KIT_ID ]: referrerKitId } =
			this.getDataFromCache();

		if ( undefined === referrerKitId ) {
			return;
		}

		if ( 0 === referrerKitId.length ) {
			this.showRevertSuccessDialog();
			return;
		}

		this.showReferrerKitDialog( referrerKitId );
	}

	getActiveKitName() {
		const lastKit = elementorImportExport.lastImportedSession;

		if ( lastKit.kit_title ) {
			return lastKit.kit_title;
		}

		if ( lastKit.kit_name ) {
			return this.convertNameToTitle( lastKit.kit_name );
		}

		return __( 'Your Kit', 'elementor' );
	}

	convertNameToTitle( name ) {
		return name
			.split( RevertKitHandler.NAME_SEPARATOR_PATTERN )
			.map( ( word ) => word[ 0 ].toUpperCase() + word.substring( 1 ) )
			.join( ' ' );
	}

	getReferrerKitId() {
		if ( ! this.revertButton ) {
			return '';
		}

		return (
			new URLSearchParams( this.revertButton.href ).get(
				RevertKitHandler.URL_PARAM_REFERRER_KIT,
			) || ''
		);
	}

	saveToCache( referrerKitId, activeKitName ) {
		sessionStorage.setItem(
			RevertKitHandler.KIT_DATA_KEY,
			JSON.stringify( {
				[ RevertKitHandler.CACHE_KEYS.REFERRER_KIT_ID ]: referrerKitId || '',
				[ RevertKitHandler.CACHE_KEYS.ACTIVE_KIT_NAME ]: activeKitName || '',
			} ),
		);
	}

	getDataFromCache() {
		try {
			return (
				JSON.parse( sessionStorage.getItem( RevertKitHandler.KIT_DATA_KEY ) ) || {}
			);
		} catch ( e ) {
			return {};
		}
	}

	clearCache() {
		sessionStorage.removeItem( RevertKitHandler.KIT_DATA_KEY );
	}

	defaultSuccessHandler() {}

	defaultErrorHandler() {
		elementorCommon.dialogsManager
			.createWidget( 'alert', {
				message: __(
					'An error occurred while reverting the kit. Please try again.',
					'elementor',
				),
			} )
			.show();
	}
}
