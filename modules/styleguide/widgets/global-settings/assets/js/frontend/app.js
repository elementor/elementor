import useSettings from "./hooks/use-site-settings";
import Header from "./areas/header";
import styled from "styled-components";
import ActiveElementProvider from "./providers/active-element-provider";
import { createContext, useRef } from "react";
import ColorsArea from "./areas/colors-area";
import FontsArea from "./areas/fonts-area";

export const ConfigContext = createContext( {} );

const Content = styled.div`
  padding: 0 5% 0 5%;
`;

const App = ( { config } ) => {
	const fontsRef = useRef( null );
	const colorsRef = useRef( null );

	const headerButtons = [
		{ name: 'colors', label: 'Colors', onClick: () => colorsRef.current.scrollIntoView( { behaviour: 'smooth' } ) },
		{ name: 'fonts', label: 'Fonts', onClick: () => fontsRef.current.scrollIntoView( { behaviour: 'smooth' } ) },
	];

	// useEffect( () => {
	// 	window.top.elementor.changeEditMode( 'picker' );
	// }, [] ); // todo remove this

	const { settings } = useSettings( config.settings );

	return (
		<div className='App'>
			<ActiveElementProvider>
			<ConfigContext.Provider value={ config }>
				<Header buttons={headerButtons}/>
				<Content>
					<ColorsArea ref={ colorsRef }
					            settings={ settings }/>
					<FontsArea ref={ fontsRef }
					           settings={ settings }/>
				</Content>
			</ConfigContext.Provider>
			</ActiveElementProvider>
        </div>
	);
};

export default App;