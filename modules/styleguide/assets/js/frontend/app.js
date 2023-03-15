import React, { createContext } from 'react';
import styled from 'styled-components';
import { SettingsProvider } from './contexts/settings';
import ActiveProvider from './contexts/active-context';
import Header from './components/header';
import ColorsArea from './components/areas/colors-area';
import FontsArea from './components/areas/fonts-area';
import AppWrapper from './components/app-wrapper';

export const ConfigContext = createContext( {} );

const Content = styled.div`
	padding-top: 50px;
`;

export default function App() {
	return (
		<SettingsProvider>
			<AppWrapper>
				<ActiveProvider>
					<Header />
					<Content>
						<ColorsArea />
						<FontsArea />
					</Content>
				</ActiveProvider>
			</AppWrapper>
		</SettingsProvider>
	);
}
