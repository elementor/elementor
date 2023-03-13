import React, { createContext, useRef } from 'react';
import styled from 'styled-components';
import { SettingsProvider } from './context/settings';
import ActiveElement from './context/active-element';
import Header from './components/areas/header';
import ColorsArea from './components/areas/colors-area';
import FontsArea from './components/areas/fonts-area';
import AppWrapper from './components/app-wrapper';

export const ConfigContext = createContext( {} );

const Content = styled.div`
	padding-top: 50px;
`;

export default function App() {
	const fontsRef = useRef( null );
	const colorsRef = useRef( null );
	const anchors = {
		colors: colorsRef,
		fonts: fontsRef,
	};

	return (
		<SettingsProvider>
			<ActiveElement>
				<AppWrapper>
					<Header anchors={ anchors } />
					<Content>
						<ColorsArea />
						<FontsArea />
					</Content>
				</AppWrapper>
			</ActiveElement>
		</SettingsProvider>
	);
}
