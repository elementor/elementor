import { apiRequest } from './utils/api-request';

export class RevertKitHandler {
	static API_PATH = 'revert';
	static DIALOG_ID = 'e-revert-kit-deleted-dialog';
	static URL_PARAM_REFERRER_KIT = 'referrer_kit';
	static URL_PARAM_RETURN_TO = 'return_to';
	static URL_PARAM_NO_AUTOMATIC_REDIRECT = 'no_automatic_redirect';
	static KIT_DATA_KEY = 'elementor-kit-data';
	static NAME_SEPARATOR_PATTERN = /[-_]+/;

	constructor( { revertButton, onError } = {} ) {
		this.revertButton = revertButton;
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
			const returnTo = this.getReturnTo();
			const noAutomaticRedirect = this.getNoAutomaticRedirect();
			this.saveToCache( referrerKitId, activeKitName, returnTo, noAutomaticRedirect );

			const { data } = await this.callRevertAPI();
			this.handleRevertResponse( data );
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

	handleRevertResponse( data ) {
		if ( ! data.revert_completed ) {
			this.handleRevertNoSessions( data );
			return;
		}

		this.showRevertCompletedDialog( data );
	}

	showRevertCompletedDialog() {
		const referrerKitId = this.getReferrerKitId();

		if ( referrerKitId ) {
			this.showReferrerKitDialog( referrerKitId );
			return;
		}

		this.showRevertSuccessDialog();
	}

	handleRevertNoSessions( responseData ) {
		elementorCommon.dialogsManager
			.createWidget( 'alert', {
				message:
					responseData.message ||
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
						"Removing %s will permanently delete changes made to the Website Template's content and site settings",
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

	createSuccessHeaderMessage() {
		const { activeKitName } = this.getDataFromCache();

		/* Translators: %s: Kit name */
		return __( '%s was successfully deleted', 'elementor' ).replace(
			'%s',
			activeKitName,
		);
	}

	showRevertSuccessDialog() {
		elementorCommon.dialogsManager
			.createWidget( 'confirm', {
				id: RevertKitHandler.DIALOG_ID,
				headerMessage: this.createSuccessHeaderMessage(),
				message: __(
					'Try a different Website Template or build your site from scratch.',
					'elementor',
				),
				strings: {
					confirm: __( 'OK', 'elementor' ),
					cancel: __( 'Library', 'elementor' ),
				},
				onConfirm: () => {
					location.reload();
				},
				onCancel: () => {
					location.href = elementorImportExport.appUrl;
				},
			} )
			.show();

		this.clearCache();
	}

	showReferrerKitDialog( referrerKitId ) {
		const { returnTo, noAutomaticRedirect } = this.getDataFromCache();

		elementorCommon.dialogsManager
			.createWidget( 'confirm', {
				id: RevertKitHandler.DIALOG_ID,
				headerMessage: this.createSuccessHeaderMessage(),
				message: __( "You're ready to apply a new Kit!", 'elementor' ),
				strings: {
					confirm: __( 'Continue to new Kit', 'elementor' ),
					cancel: __( 'Close', 'elementor' ),
				},
				onConfirm: () => {
					location.href = this.buildPreviewUrl( referrerKitId, returnTo, noAutomaticRedirect );
				},
				onCancel: () => {
					location.reload();
				},
			} )
			.show();

		this.clearCache();
	}

	buildPreviewUrl( referrerKitId, returnTo, noAutomaticRedirect ) {
		const baseUrl = elementorImportExport.appUrl + '/preview/' + referrerKitId;
		const url = new URL( baseUrl );

		if ( returnTo ) {
			url.searchParams.append( RevertKitHandler.URL_PARAM_RETURN_TO, returnTo );
		}
		if ( noAutomaticRedirect ) {
			url.searchParams.append( RevertKitHandler.URL_PARAM_NO_AUTOMATIC_REDIRECT, noAutomaticRedirect );
		}

		return url.toString();
	}

	maybeShowReferrerKitDialog() {
		const { referrerKitId } = this.getDataFromCache();

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
		const words = name
			.split( RevertKitHandler.NAME_SEPARATOR_PATTERN )
			.filter( ( word ) => word.length > 0 );

		if ( 0 === words.length ) {
			return __( 'Your Kit', 'elementor' );
		}

		return words
			.map( ( word ) => word[ 0 ].toUpperCase() + word.substring( 1 ) )
			.join( ' ' );
	}

	getReferrerKitId() {
		const urlParams = new URLSearchParams( window.location.search );
		const pageReferrerKit = urlParams.get( RevertKitHandler.URL_PARAM_REFERRER_KIT );
		if ( pageReferrerKit ) {
			return pageReferrerKit;
		}

		if ( ! this.revertButton ) {
			return '';
		}

		return (
			new URL( this.revertButton.href ).searchParams.get(
				RevertKitHandler.URL_PARAM_REFERRER_KIT,
			) || ''
		);
	}

	getReturnTo() {
		const urlParams = new URLSearchParams( window.location.search );
		return urlParams.get( RevertKitHandler.URL_PARAM_RETURN_TO ) || '';
	}

	getNoAutomaticRedirect() {
		const urlParams = new URLSearchParams( window.location.search );
		return urlParams.get( RevertKitHandler.URL_PARAM_NO_AUTOMATIC_REDIRECT ) || '';
	}

	saveToCache( referrerKitId, activeKitName, returnTo, noAutomaticRedirect ) {
		sessionStorage.setItem(
			RevertKitHandler.KIT_DATA_KEY,
			JSON.stringify( {
				referrerKitId: referrerKitId || '',
				activeKitName: activeKitName || '',
				returnTo: returnTo || '',
				noAutomaticRedirect: noAutomaticRedirect || '',
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
