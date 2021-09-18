import { useState, useEffect } from 'react';

import useAjax from 'elementor-app/hooks/use-ajax';

const KIT_STATUS_MAP = {
	INITIAL: 'initial',
	UPLOADED: 'uploaded',
	IMPORTED: 'imported',
	ERROR: 'error',
};

export default function useKit() {
	const { ajaxState, setAjax, ajaxActions } = useAjax(),
		kitStateInitialState = {
			status: KIT_STATUS_MAP.INITIAL,
			data: null,
		},
		[ kitState, setKitState ] = useState( kitStateInitialState ),
		getAjaxConfig = () => {
			return {
				data: {
					action: 'elementor_import_kit',
				},
			};
		},
		uploadKit = ( { file } ) => {
			const ajaxConfig = getAjaxConfig();

			ajaxConfig.data.e_import_file = file;
			ajaxConfig.data.data = JSON.stringify( {
				stage: 1,
			} );

			setAjax( ajaxConfig );
		},
		importKit = ( { session, include, overrideConditions, referrer } ) => {
			const ajaxConfig = getAjaxConfig();

			ajaxConfig.data.data = {
				stage: 2,
				session,
				include,
				overrideConditions,
			};

			if ( referrer ) {
				ajaxConfig.data.data.referrer = referrer;
			}

			ajaxConfig.data.data = JSON.stringify( ajaxConfig.data.data );

			setAjax( ajaxConfig );
		},
		reset = () => ajaxActions.reset();

	useEffect( () => {
		if ( 'initial' !== ajaxState.status ) {
			const newState = {};

			if ( 'success' === ajaxState.status ) {
				// When importing only the site-settings the response is empty.
				newState.data = ajaxState.response || {};

				newState.status = ajaxState.response?.manifest ? KIT_STATUS_MAP.UPLOADED : KIT_STATUS_MAP.IMPORTED;
			} else if ( 'error' === ajaxState.status ) {
				newState.status = KIT_STATUS_MAP.ERROR;
			}

			setKitState( ( prevState ) => ( { ...prevState, ...newState } ) );
		}
	}, [ ajaxState.status ] );

	return {
		kitState,
		KIT_STATUS_MAP,
		kitActions: {
			upload: uploadKit,
			import: importKit,
			reset,
		},
	};
}
