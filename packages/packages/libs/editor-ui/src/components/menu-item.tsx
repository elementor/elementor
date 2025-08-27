import * as React from 'react';
import { forwardRef } from 'react';
import { Infotip, MenuItem, type MenuItemProps, MenuItemText } from '@elementor/ui';

import { InfoAlert } from './info-alert';

export const MenuListItem = ( { children, ...props }: MenuItemProps ) => {
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
				primaryTypographyProps={ {
					variant: 'caption',
				} }
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
