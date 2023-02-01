import * as React from 'react';
import { Divider as BaseDivider, DividerProps, styled } from '@elementor/ui';

const StyledDivider = styled( BaseDivider )( () => ( {
	borderColor: 'rgba(255, 255, 255, 0.1)',
} ) );

export default function Divider( props: DividerProps ) {
	return (
		<StyledDivider { ...props } />
	);
}
