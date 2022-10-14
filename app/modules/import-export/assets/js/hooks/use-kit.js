import { useState, useEffect } from 'react';

import useAjax from 'elementor-app/hooks/use-ajax';

const KIT_STATUS_MAP = Object.freeze( {
		INITIAL: 'initial',
		UPLOADED: 'uploaded',
		IMPORTED: 'imported',
		EXPORTED: 'exported',
		ERROR: 'error',
	} ),
	UPLOAD_KIT_KEY = 'elementor_upload_kit',
	IMPORT_KIT_KEY = 'elementor_import_kit',
	EXPORT_KIT_KEY = 'elementor_export_kit';

export default function useKit() {
	const { ajaxState, setAjax, ajaxActions } = useAjax(),
		kitStateInitialState = {
			status: KIT_STATUS_MAP.INITIAL,
			data: null,
		},
		[ kitState, setKitState ] = useState( kitStateInitialState ),
		uploadKit = ( { file, kitLibraryNonce } ) => {
			setAjax( {
				data: {
					action: UPLOAD_KIT_KEY,
					e_import_file: file,
					...( kitLibraryNonce ? { e_kit_library_nonce: kitLibraryNonce } : {} ),
				},
			} );
		},
		importKit = ( { session, include, overrideConditions, referrer, selectedCustomPostTypes } ) => {
			const ajaxConfig = {
				data: {
					action: IMPORT_KIT_KEY,
					data: {
						session,
						include,
						overrideConditions,
					},
				},
			};

			if ( referrer ) {
				ajaxConfig.data.data.referrer = referrer;
			}

			if ( selectedCustomPostTypes ) {
				ajaxConfig.data.data.selectedCustomPostTypes = selectedCustomPostTypes;
			}

			ajaxConfig.data.data = JSON.stringify( ajaxConfig.data.data );

			setAjax( ajaxConfig );
		},
		exportKit = ( { include, kitInfo, plugins, selectedCustomPostTypes } ) => {
			setAjax( {
				data: {
					action: EXPORT_KIT_KEY,
					data: JSON.stringify( {
						include,
						kitInfo,
						plugins,
						selectedCustomPostTypes,
					} ),
				},
			} );
		},
		reset = () => ajaxActions.reset();

	useEffect( () => {
		if ( 'initial' !== ajaxState.status ) {
			const newState = {};

			if ( 'success' === ajaxState.status ) {
				if ( ajaxState.response?.file ) {
					newState.status = KIT_STATUS_MAP.EXPORTED;
				} else {
					newState.status = ajaxState.response?.manifest ? KIT_STATUS_MAP.UPLOADED : KIT_STATUS_MAP.IMPORTED;
				}
			} else if ( 'error' === ajaxState.status ) {
				newState.status = KIT_STATUS_MAP.ERROR;
			}

			// The response is required even if an error occurred, in order to detect the error type.
			newState.data = ajaxState.response || {};

			setKitState( ( prevState ) => ( { ...prevState, ...newState } ) );
		}
	}, [ ajaxState.status ] );

	return {
		kitState,
		KIT_STATUS_MAP,
		kitActions: {
			upload: uploadKit,
			import: importKit,
			export: exportKit,
			reset,
		},
	};
}
