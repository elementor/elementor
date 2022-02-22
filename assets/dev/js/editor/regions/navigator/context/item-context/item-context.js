import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';

/**
 * The Item Context instance.
 *
 * @type {React.Context<{}>}
 */
export const ItemContext = createContext( {} );

/**
 * A wrapper function for using `ItemContext`.
 *
 * @returns {{}}
 */
export function useItemContext() {
	return useContext( ItemContext );
}

/**
 * A wrapper function for `ItemContext.Provider`.
 *
 * @param props
 *
 * @returns {JSX.Element}
 */
export function ItemProvider( props ) {
	// The purpose of this wrapping is to allow the value validation using PropTypes.
	return <ItemContext.Provider { ...props } />;
}

ItemProvider.propTypes = {
	value: PropTypes.shape( {
		item: PropTypes.object.isRequired,
		level: PropTypes.number.isRequired,
	} ).isRequired,
};

export default ItemContext;
