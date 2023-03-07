import useSettings from './hooks/use-site-settings';
import Header from './areas/header';
import styled from 'styled-components';
import ActiveElementProvider from './providers/active-element-provider';
import { createContext, useEffect, useRef } from 'react';
import ColorsArea from './areas/colors-area';
import FontsArea from './areas/fonts-area';
import InnerWrapper from "./areas/inner-wrapper";

export const ConfigContext = createContext( {} );

const Wrapper = styled.div`
  margin-top:50px;
`;

const App = ( { config } ) => {
	const fontsRef = useRef( null );
	const colorsRef = useRef( null );
	const anchors = {
		colors: colorsRef,
		fonts: fontsRef,
	};

	useEffect( () => {
		window.top.elementor.changeEditMode( 'picker' );
	}, [] ); // TODO remove this

	const { settings } = useSettings( config.settings );

	return (
		<Wrapper className="App">
			<ActiveElementProvider>
				<ConfigContext.Provider value={ config }>
					<Header anchors={ anchors } />
					<InnerWrapper flexDirection="column">
						<ColorsArea ref={ colorsRef } settings={ settings } />
						<FontsArea ref={ fontsRef } settings={ settings } />
					</InnerWrapper>
				</ConfigContext.Provider>
			</ActiveElementProvider>
		</Wrapper>
	);
};

export default App;
