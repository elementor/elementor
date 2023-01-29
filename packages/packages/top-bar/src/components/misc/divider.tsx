import * as React from 'react';
import { Divider as BaseDivider, styled } from '@elementor/ui';
import { useMenuContext } from '../../contexts/menu-context';

const StyledDivider = styled( BaseDivider )( () => ( {
	borderColor: 'rgba(255, 255, 255, 0.1)',
} ) );

export default function Divider() {
	const { type } = useMenuContext();

	return (
		<StyledDivider orientation={ type === 'popover' ? 'horizontal' : 'vertical' } />
	);
}
