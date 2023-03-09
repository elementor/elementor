import React, { createContext, useRef } from 'react';
import styled from 'styled-components';
import useSettings from './hooks/use-settings';
import ActiveElementProvider from './providers/active-element-provider';
import Header from './areas/header';
import ColorsArea from './areas/colors-area';
import FontsArea from './areas/fonts-area';
import Loader from './components/global/loader';

export const ConfigContext = createContext( {} );

const Content = styled.div`
	padding-top: 50px;
`;

export default function App() {
	const { isLoading, settings } = useSettings( { type: 'config' } );

	const fontsRef = useRef( null );
	const colorsRef = useRef( null );
	const anchors = {
		colors: colorsRef,
		fonts: fontsRef,
	};

	if ( isLoading ) {
		return <Loader />;
	}

	const { is_debug: isDebug } = settings.config,
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
