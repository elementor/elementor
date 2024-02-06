import { createContext, useContext, useRef } from 'react';
import PropTypes from 'prop-types';

const Context = createContext( {} );

export const useRequestIds = () => {
	const context = useContext( Context );

	if ( ! context ) {
		throw new Error( 'useRequestIds must be used within a RequestIdsProvider' );
	}

	return context;
};

export const getUniqueId = ( prefix ) => {
	return prefix + '-' + Math.random().toString( 16 ).substr( 2, 7 );
};

const EDITOR_SESSION_ID = getUniqueId( 'editor-session' );

export function generateIds( template ) {
	template.id = getUniqueId().toString();

	if ( template.elements?.length ) {
		template.elements.map( ( child ) => generateIds( child ) );
	}

	return template;
}

export const RequestIdsProvider = ( props ) => {
	const generate = useRef( '' );
	const batch = useRef( '' );
	const request = useRef( '' );

	const setGenerate = () => {
		generate.current = getUniqueId( 'generate' );
		return generate.current;
	};
	const setBatch = () => {
		batch.current = getUniqueId( 'batch' );
		return batch.current;
	};
	const setRequest = () => {
		request.current = getUniqueId( 'request' );
		return request.current;
	};

	return (
		<Context.Provider
			value={ {
				editorSession: EDITOR_SESSION_ID,
				session: getUniqueId( 'session' ),
				generate: generate.current,
				batch: batch.current,
				request: request.current,
				setGenerate,
				setBatch,
				setRequest,
			} }
		>
			{ props.children }
		</Context.Provider>
	);
};

RequestIdsProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export default Context;
