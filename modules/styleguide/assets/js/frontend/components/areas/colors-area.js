import React, { useContext } from 'react';
import styled from 'styled-components';
import { ActiveContext } from '../../contexts/active-context';
import Area from './area';
import Color from '../item/color';

const Wrapper = styled.div`
	width: 100%;
	margin-top: 95px;

	@media (max-width: 1024px) {
		margin-top: 45px;
	}
`;

export default function ColorsArea() {
	const { colorsAreaRef } = useContext( ActiveContext );

	const areaConfig = {
		title: __( 'Global Colors', 'elementor' ),
		type: 'colors',
		component: Color,
		sections: [
			{
				type: 'system_colors',
				title: __( 'System Colors', 'elementor' ),
				columns: {
					desktop: 4,
					mobile: 2,
				},
			},
			{
				type: 'custom_colors',
				title: __( 'Custom Colors', 'elementor' ),
				columns: {
					desktop: 6,
					mobile: 2,
				},
			},
		],
	};

	return (
		<Wrapper ref={ colorsAreaRef }>
			<Area config={ areaConfig } />
		</Wrapper>
	);
}
