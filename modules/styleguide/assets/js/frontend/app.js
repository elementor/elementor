import React, { createContext, useRef } from 'react';
import styled from 'styled-components';
import useSettings from './hooks/use-settings';
import ActiveProvider from './contexts/active-context';
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

	if ( isLoading ) {
		return <Loader />;
	}

	const { is_debug: isDebug } = settings,
		Wrapper = isDebug ? React.StrictMode : React.Fragment;

	return (
		<Wrapper>
			<ActiveProvider>
				<Header />
				<Content>
					<ColorsArea />
					<FontsArea />
				</Content>
			</ActiveProvider>
		</Wrapper>
	);
}
