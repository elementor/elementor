import React, { useContext } from 'react';
import { ActiveContext } from '../../contexts/active-context';
import Area from './area';
import Font from '../item/font';

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
		<Area ref={ fontsAreaRef } config={ areaConfig } />
	);
}
