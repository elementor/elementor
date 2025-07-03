import * as React from 'react';
import { type PropsWithChildren, type ReactElement } from 'react';
import { styled, UnstableFloatingActionBar } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import { useControlActions } from './control-actions-context';

// CSS hack to hide empty floating bars.
const FloatingBarContainer = styled( 'span' )`
	display: contents;

	.MuiFloatingActionBar-popper:has( .MuiFloatingActionBar-actions:empty ) {
		display: none;
	}

	.MuiFloatingActionBar-popper {
		z-index: 1000;
	}
`;

type ControlActionsProps = PropsWithChildren< object >;

export default function ControlActions( { children }: ControlActionsProps ) {
	const { items } = useControlActions();
	const { disabled } = useBoundProp();

	if ( items.length === 0 || disabled ) {
		return children;
	}

	const menuItems = items.map( ( { MenuItem, id } ) => <MenuItem key={ id } /> );

	return (
		<FloatingBarContainer>
			<UnstableFloatingActionBar actions={ menuItems }>{ children as ReactElement }</UnstableFloatingActionBar>
		</FloatingBarContainer>
	);
}
