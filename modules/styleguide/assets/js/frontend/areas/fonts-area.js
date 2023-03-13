import React, { useContext, useEffect, useRef } from 'react';
import AreaTitle from './area-title';
import Section from '../components/section';
import { ActiveContext } from '../contexts/active-context';
import { addEventListener, AFTER_COMMAND_EVENT } from '../utils/top-events';
import useSettings from '../hooks/use-settings';
import styled from 'styled-components';
import Loader from '../components/global/loader';
import Font from '../components/item/font';

const Wrapper = styled.div`
	width: 100%;
	margin-top: 95px;

	@media (max-width: 640px) {
		margin-top: 45px;
	}
`;

export default function FontsArea() {
	const { fontsAreaRef } = useContext( ActiveContext );

	const { isLoading, settings } = useSettings( { type: 'typography' } );

	if ( isLoading ) {
		return <Loader />;
	}

	return (
		<Wrapper ref={ fontsAreaRef }>
			<AreaTitle name="fonts">Global Fonts</AreaTitle>
			<Section title="System Fonts"
				source={ settings.system_typography }
				type="system"
				flex={ 'column' }
				component={ Font }
				/>
			<Section title="Custom Fonts"
				source={ settings.custom_typography }
				type="custom"
				flex={ 'column' }
				component={ Font }
				/>
		</Wrapper>
	);
}
