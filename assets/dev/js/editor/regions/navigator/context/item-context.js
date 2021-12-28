import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';

/**
 * The Item Context instance.
 *
 * @var {React.Context<{}>}
 */
const ItemContext = createContext( {} );

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
 * @param value
 * @param children
 *
 * @returns {JSX.Element}
 */
export function ItemProvider( { value, children } ) {
	return (
		<ItemContext.Provider value={ value }>
			{ children }
		</ItemContext.Provider>
	);
}

ItemProvider.propTypes = {
	value: PropTypes.object,
	children: PropTypes.node,
};
