import { useEffect } from 'react';
import { __useDispatch as useDispatch } from '@elementor/store';

import { apiClient } from '../api';
import { slice } from '../store';

export function GlobalStylesImportListener() {
	const dispatch = useDispatch();

	useEffect( () => {
		const handleGlobalStylesImported = () => {
			Promise.all( [ apiClient.all( 'preview' ), apiClient.all( 'frontend' ) ] ).then(
				( [ previewRes, frontendRes ] ) => {
					const { data: previewData } = previewRes;
					const { data: frontendData } = frontendRes;

					dispatch(
						slice.actions.load( {
							preview: {
								items: previewData.data,
								order: previewData.meta.order,
							},
							frontend: {
								items: frontendData.data,
								order: frontendData.meta.order,
							},
						} )
					);
				}
			);
		};

		window.addEventListener( 'elementor/global-styles/imported', handleGlobalStylesImported );

		return () => {
			window.removeEventListener( 'elementor/global-styles/imported', handleGlobalStylesImported );
		};
	}, [ dispatch ] );

	return null;
}
