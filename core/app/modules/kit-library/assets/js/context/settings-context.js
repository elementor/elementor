const { createContext, useContext } = React;

const SettingsContext = createContext( {} );

/**
 * Consume the context
 *
 * @returns {{emptyTrashDays: number}}
 */
export function useSettingsContext() {
	return useContext( SettingsContext );
}

/**
 * Settings Provider
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function SettingsProvider( props ) {
	return (
		<SettingsContext.Provider value={ props.value }>
			{ props.children }
		</SettingsContext.Provider>
	);
}

SettingsProvider.propTypes = {
	children: PropTypes.any,
	value: PropTypes.object.isRequired,
};
