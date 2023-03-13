import React, { useContext } from 'react';
import styled from 'styled-components';
import { ActiveContext } from '../../contexts/active-context';
import Area from './area';
import Font from '../item/font';

const Wrapper = styled.div`
	width: 100%;
	margin-top: 95px;

	@media (max-width: 640px) {
		margin-top: 45px;
	}
`;

export default function FontsArea() {
	const { fontsAreaRef } = useContext( ActiveContext );

	const areaConfig = {
		title: __( 'Global Fonts', 'elementor' ),
		type: 'fonts',
		component: Font,
		sections: [
			{
				type: 'system_typography',
				title: __( 'System Fonts', 'elementor' ),
				flex: 'column',
				columns: {
					desktop: 1,
					mobile: 1,
				},
			},
			{
				type: 'custom_typography',
				title: __( 'Custom Fonts', 'elementor' ),
				flex: 'column',
				columns: {
					desktop: 1,
					mobile: 1,
				},
			},
		],
	};

	return (
		<Wrapper ref={ fontsAreaRef }>
			<Area config={ areaConfig } />
		</Wrapper>
	);
}
