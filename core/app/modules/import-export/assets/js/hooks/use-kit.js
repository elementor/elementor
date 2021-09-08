import useAjax from 'elementor-app/hooks/use-ajax';

export default function useKit() {
	const { ajaxState, setAjax, ajaxActions } = useAjax(),
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

	return {
		kitState: ajaxState,
		kitActions: {
			upload: uploadKit,
			import: importKit,
			reset,
		},
	};
}
