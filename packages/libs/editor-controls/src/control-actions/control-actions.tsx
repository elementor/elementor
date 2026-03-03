import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { FloatingActionsBar } from '@elementor/editor-ui';

import { useBoundProp } from '../bound-prop-context';
import { useControlActions } from './control-actions-context';

type ControlActionsProps = PropsWithChildren< object >;

export default function ControlActions( { children }: ControlActionsProps ) {
	const { items } = useControlActions();
	const { disabled } = useBoundProp();

	if ( items.length === 0 || disabled ) {
		return children;
	}

	const menuItems = items.map( ( { MenuItem, id } ) => <MenuItem key={ id } /> );

	return <FloatingActionsBar actions={ menuItems }>{ children }</FloatingActionsBar>;
}
