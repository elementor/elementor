import React, { createContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
import useSettings from './hooks/use-site-settings';
import ActiveElementProvider from './providers/active-element-provider';
import Header from './areas/header';
import ColorsArea from './areas/colors-area';
import FontsArea from './areas/fonts-area';

export const ConfigContext = createContext( {} );

const Content = styled.div`
	padding: 0 5% 0 5%;
`;

export default function App( { config } ) {
	const fontsRef = useRef( null );
	const colorsRef = useRef( null );
	const anchors = {
		colors: colorsRef,
		fonts: fontsRef,
	};

	const { settings } = useSettings( config.settings );
	const { is_debug: isDebug } = settings,
		Wrapper = isDebug ? React.StrictMode : React.Fragment;

	return (
		<Wrapper>
			<ActiveElementProvider>
				<ConfigContext.Provider value={ config }>
					<Header anchors={ anchors } />
					<Content>
						<ColorsArea ref={ colorsRef } settings={ settings } />
						<FontsArea ref={ fontsRef } settings={ settings } />
					</Content>
				</ConfigContext.Provider>
			</ActiveElementProvider>
		</Wrapper>
	);
}
