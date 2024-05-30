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

window.EDITOR_SESSION_ID = window.EDITOR_SESSION_ID || window.ElementorAiConfig?.client_session_id || getUniqueId( 'editor-session' );

export function generateIds( template ) {
	template.id = getUniqueId().toString();

	if ( template.elements?.length ) {
		template.elements.map( ( child ) => generateIds( child ) );
	}

	return template;
}

export const RequestIdsProvider = ( props ) => {
	const editorSessionId = useRef( window.EDITOR_SESSION_ID );
	const sessionId = useRef( '' );
	const generateId = useRef( '' );
	const batchId = useRef( '' );
	const requestId = useRef( '' );

	sessionId.current = getUniqueId( 'session' );
	const setGenerate = () => {
		generateId.current = getUniqueId( 'generate' );
		return generateId;
	};
	const setBatch = () => {
		batchId.current = getUniqueId( 'batch' );
		return batchId;
	};
	const setRequest = () => {
		requestId.current = getUniqueId( 'request' );
		return requestId;
	};

	return (
		<Context.Provider
			value={ {
				editorSessionId,
				sessionId,
				generateId,
				batchId,
				requestId,
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
