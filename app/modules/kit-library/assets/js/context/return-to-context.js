import { createContext, useContext } from 'react';

const ReturnToContext = createContext( null );

export function useReturnTo() {
	return useContext( ReturnToContext );
}

export function ReturnToProvider( props ) {
	return (
		<ReturnToContext.Provider value={ props.value }>
			{ props.children }
		</ReturnToContext.Provider>
	);
}

ReturnToProvider.propTypes = {
	children: PropTypes.any,
	value: PropTypes.string,
};
