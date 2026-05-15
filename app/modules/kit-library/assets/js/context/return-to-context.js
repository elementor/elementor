import { createContext, useContext } from 'react';

const ReturnToContext = createContext( null );

export function useReturnTo() {
	return useContext( ReturnToContext );
}

export function ReturnToProvider( { value, children } ) {
	return (
		<ReturnToContext.Provider value={ value }>
			{ children }
		</ReturnToContext.Provider>
	);
}

ReturnToProvider.propTypes = {
	children: PropTypes.any,
	value: PropTypes.string,
};
