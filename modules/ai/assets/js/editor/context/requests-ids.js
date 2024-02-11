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
	const generateId = useRef( '' );
	const batchId = useRef( '' );
	const requestId = useRef( '' );

	const setGenerate = () => {
		generateId.current = getUniqueId( 'generate' );
		return generateId.current;
	};
	const setBatch = () => {
		batchId.current = getUniqueId( 'batch' );
		return batchId.current;
	};
	const setRequest = () => {
		requestId.current = getUniqueId( 'request' );
		return requestId.current;
	};

	return (
		<Context.Provider
			value={ {
				editorSessionId: EDITOR_SESSION_ID,
				sessionId: getUniqueId( 'session' ),
				generateId: generateId.current,
				batchId: batchId.current,
				requestId: requestId.current,
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
