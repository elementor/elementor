import * as React from 'react';
import { type ElementType, useId, useLayoutEffect } from 'react';
import { Box, IconButton, type IconButtonProps, Tooltip } from '@elementor/ui';

import { acquireSidebarRailLock, useIsSidebarRailLocked } from '../../rail-lock';

export type Props = {
	title: string;
	id?: string;
	icon: ElementType;
	selected?: boolean;
	disabled?: boolean;
	exclusive?: boolean;
	visible?: boolean;
	onClick?: () => void;
};

export default function Action( {
	icon: Icon,
	title,
	selected,
	exclusive,
	disabled,
	visible = true,
	...props
}: Props ) {
	const key = useId();
	const isOwner = visible && !! exclusive && !! selected;
	const isLocked = useIsSidebarRailLocked( key );

	useLayoutEffect( () => ( isOwner ? acquireSidebarRailLock( key ) : undefined ), [ isOwner, key ] );

	if ( ! visible ) {
		return null;
	}

	return (
		<Tooltip title={ title } placement="right">
			{ /* @see https://mui.com/material-ui/react-tooltip/#disabled-elements */ }
			<Box component="span">
				<IconButton
					{ ...props }
					disabled={ disabled || isLocked }
					aria-label={ title }
					aria-pressed={ selected }
					size={ 'unstableTiny' as IconButtonProps[ 'size' ] }
				>
					<Icon fontSize="small" />
				</IconButton>
			</Box>
		</Tooltip>
	);
}
