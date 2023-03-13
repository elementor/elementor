import React, { useContext, useEffect, useRef } from 'react';
import AreaTitle from './area-title';
import Section from '../components/section';
import { ActiveContext } from '../contexts/active-context';
import styled from 'styled-components';
import Loader from '../components/global/loader';
import Color from '../components/item/color';
import useSettings from '../hooks/use-settings';

const Wrapper = styled.div`
	width: 100%;
	margin-top: 95px;

	@media (max-width: 1024px) {
		margin-top: 45px;
	}
`;

export default function ColorsArea() {
	const { colorsAreaRef } = useContext( ActiveContext );

	const { isLoading, settings } = useSettings( { type: 'colors' } );

	if ( isLoading ) {
		return <Loader />;
	}

	return (
		<Wrapper ref={ colorsAreaRef }>
			<AreaTitle name="colors">Global Colors</AreaTitle>
			<Section title="System Colors"
				source={ settings.system_colors }
				colorWidth="191px"
				component={ Color }
				type="system"
			/>
			<Section title="Custom Colors"
				source={ settings.custom_colors }
				colorWidth="114px"
				component={ Color }
				type="custom"
			/>
		</Wrapper>
	);
}
