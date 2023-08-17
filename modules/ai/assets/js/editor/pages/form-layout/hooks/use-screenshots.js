import { useState, useRef } from 'react';
import useLayoutPrompt from '../hooks/use-layout-prompt';

const PENDING_VALUE = { isPending: true };

const useScreenshots = ( { onData } ) => {
	const [ screenshots, setScreenshots ] = useState( [] );

	const styling = useLayoutPrompt( 'styling', null );
	const wireframe = useLayoutPrompt( 'wireframe', null );
	const mixed = useLayoutPrompt( 'mixed', null );

	const abortController = useRef( null );

	const templatesData = [ styling, wireframe, mixed ];

	const screenshotsGroupCount = templatesData.length;

	const isLoading = templatesData.some( ( t ) => t.isLoading );

	const error = templatesData.every( ( t ) => t.error ) ? templatesData[ 0 ].error : '';

	const abort = () => abortController.current?.abort();

	const createScreenshots = async ( prompt ) => {
		abortController.current = new AbortController();

		const promises = templatesData.map( ( { send } ) => {
			return send( prompt, abortController.current.signal )
				.then( async ( data ) => {
					const templateData = await onData( data.result );

					setScreenshots( ( prev ) => {
						const updatedData = [ ...prev ];
						const pendingIndex = updatedData.indexOf( PENDING_VALUE );

						updatedData[ pendingIndex ] = templateData;

						return updatedData;
					} );

					return true;
				} )
				.catch( () => {
					setScreenshots( ( prev ) => {
						const updatedData = [ ...prev ];
						const pendingIndex = updatedData.lastIndexOf( PENDING_VALUE );

						updatedData[ pendingIndex ] = { isError: true };

						return updatedData;
					} );

					return false;
				} );
		} );

		const results = await Promise.all( promises );
		const isAllFailed = results.every( ( value ) => false === value );

		if ( isAllFailed ) {
			setScreenshots( ( prev ) => {
				const updatedData = [ ...prev ];

				updatedData.splice( screenshotsGroupCount * -1 );

				return updatedData;
			} );
		}
	};

	const generate = ( prompt ) => {
		const placeholders = Array( screenshotsGroupCount ).fill( PENDING_VALUE );

		setScreenshots( placeholders );

		createScreenshots( prompt );
	};

	const regenerate = ( prompt ) => {
		const placeholders = Array( screenshotsGroupCount ).fill( PENDING_VALUE );

		setScreenshots( ( prev ) => [ ...prev, ...placeholders ] );

		createScreenshots( prompt );
	};

	return {
		generate,
		regenerate,
		screenshots,
		isLoading,
		error,
		abort,
	};
};

export default useScreenshots;
