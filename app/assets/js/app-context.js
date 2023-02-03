import { useState } from 'react';

export const AppContext = React.createContext();

export default function AppProvider( props ) {
	const initialState = {
			isDarkMode: document.body.classList.contains( `eps-theme-dark` ),
		},
		[ state, setState ] = useState( initialState );

	return (
		<AppContext.Provider value={ { state, setState } }>
			{ props.children }
		</AppContext.Provider>
	);
}

AppProvider.propTypes = {
	children: PropTypes.object.isRequired,
};
