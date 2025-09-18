import * as React from 'react';
import { forwardRef } from 'react';
import {
	Infotip,
	MenuItem,
	type MenuItemProps,
	MenuItemText,
	type MenuItemTextProps,
	type TypographyProps,
} from '@elementor/ui';

import { InfoAlert } from './info-alert';
type MenuListItemProps = MenuItemProps & {
	menuItemTextProps?: MenuItemTextProps;
	primaryTypographyProps?: TypographyProps;
};
export const MenuListItem = ( {
	children,
	menuItemTextProps,
	primaryTypographyProps = { variant: 'caption' },
	...props
}: MenuListItemProps ) => {
	return (
		<MenuItem
			dense
			{ ...props }
			sx={ {
				...( props.sx ?? {} ),
			} }
		>
			<MenuItemText
				primary={ children }
				primaryTypographyProps={ primaryTypographyProps }
				{ ...menuItemTextProps }
			/>
		</MenuItem>
	);
};

type MenuItemInfotipProps = React.PropsWithChildren< {
	showInfoTip?: boolean;
	children: React.ReactNode;
	content: string;
} >;

export const MenuItemInfotip = forwardRef(
	( { showInfoTip = false, children, content }: MenuItemInfotipProps, ref: unknown ) => {
		if ( ! showInfoTip ) {
			return <>{ children }</>;
		}

		return (
			<Infotip
				ref={ ref }
				placement={ 'right' }
				arrow={ false }
				content={ <InfoAlert sx={ { maxWidth: 325 } }>{ content }</InfoAlert> }
			>
				{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */ }
				<div style={ { pointerEvents: 'initial', width: '100%' } } onClick={ ( e ) => e.stopPropagation() }>
					{ children }
				</div>
			</Infotip>
		);
	}
);
