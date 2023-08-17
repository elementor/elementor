import { useState, useRef } from 'react';
import useLayoutPrompt from '../hooks/use-layout-prompt';

const PENDING_VALUE = {};

const useScreenshots = ( { onData } ) => {
	const [ screenshots, setScreenshots ] = useState( [] );

	const styling = useLayoutPrompt( 'styling', null );
	const wireframe = useLayoutPrompt( 'wireframe', null );
	const mixed = useLayoutPrompt( 'mixed', null );

	const abortController = useRef( null );

	const templatesData = [ styling, wireframe, mixed ];

	const isLoading = templatesData.some( ( t ) => t.isLoading );

	const error = ( 0 === screenshots.length && templatesData.find( ( t ) => t.error ) ) || '';

	const abort = () => abortController.current?.abort();

	const createScreenshots = ( prompt ) => {
		abortController.current = new AbortController();

		templatesData.forEach( async ( { send } ) => {
			send( prompt, abortController.current.signal )
				.then( async ( data ) => {
					const templateData = await onData( data.result );

					setScreenshots( ( prev ) => {
						const updatedData = [ ...prev ];
						const placeholderIndex = updatedData.indexOf( PENDING_VALUE );

						updatedData[ placeholderIndex ] = templateData;

						return updatedData;
					} );
				} )
				.catch( () => {
					setScreenshots( ( prev ) => {
						const updatedData = [ ...prev ];
						const placeholderIndex = updatedData.lastIndexOf( PENDING_VALUE );

						updatedData[ placeholderIndex ] = { isPlaceholder: true };

						return updatedData;
					} );
				} );
		} );
	};

	const generate = ( prompt ) => {
		const placeholders = Array( templatesData.length ).fill( PENDING_VALUE );

		setScreenshots( placeholders );

		createScreenshots( prompt );
	};

	const regenerate = ( prompt ) => {
		const placeholders = Array( templatesData.length ).fill( PENDING_VALUE );

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
