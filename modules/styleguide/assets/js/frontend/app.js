import React, { createContext, useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import useSettings from './hooks/use-settings';
import ActiveElementProvider from './providers/active-element-provider';
import Header from './areas/header';
import ColorsArea from './areas/colors-area';
import FontsArea from './areas/fonts-area';

export const ConfigContext = createContext( {} );

const Content = styled.div`
	padding: 0 5% 0 5%;
`;

export default function App() {
	const { isLoading, settings } = useSettings();
	const fontsRef = useRef( null );
	const colorsRef = useRef( null );
	const anchors = {
		colors: colorsRef,
		fonts: fontsRef,
	};

	if ( isLoading ) {
		return <div>Loading</div>;
		// TODO: Replace by a normal loader
	}

	const { is_debug: isDebug } = settings,
		Wrapper = isDebug ? React.StrictMode : React.Fragment;

	return (
		<Wrapper>
			<ActiveElementProvider>
				<Header anchors={ anchors } />
				<Content>
					<ColorsArea />
					<FontsArea />
				</Content>
			</ActiveElementProvider>
		</Wrapper>
	);
}
