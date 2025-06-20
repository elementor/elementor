import * as React from 'react';
import { Divider, styled } from '@elementor/ui';

import { default as PopoverMenu, type PopoverMenuProps } from '../../../components/ui/popover-menu';
import { documentOptionsMenu } from '../locations';

const { useMenuItems } = documentOptionsMenu;

// CSS hack to hide dividers for empty menu items, due to a limitation in the locations' mechanism.
const StyledPopoverMenu = styled( PopoverMenu )`
	& > .MuiPopover-paper > .MuiList-root {
		& > .MuiDivider-root {
			display: none;
		}

		& > *:not( .MuiDivider-root ):not( :last-of-type ) + .MuiDivider-root {
			display: block;
		}
	}
`;

export default function PrimaryActionMenu( props: PopoverMenuProps ) {
	const { save: saveActions, default: defaultActions } = useMenuItems();

	return (
		<StyledPopoverMenu
			{ ...props }
			anchorOrigin={ {
				vertical: 'bottom',
				horizontal: 'right',
			} }
			transformOrigin={ {
				vertical: 'top',
				horizontal: 'right',
			} }
			marginThreshold={ 4 }
			PaperProps={ {
				sx: { mt: 0.5 },
			} }
		>
			{ saveActions.map( ( { MenuItem, id }, index ) => [
				index > 0 && <Divider key={ `${ id }-divider` } />,
				<MenuItem key={ id } />,
			] ) }

			{ saveActions.length > 0 && defaultActions.length > 0 && <Divider /> }

			{ defaultActions.map( ( { MenuItem, id }, index ) => [
				index > 0 && <Divider key={ `${ id }-divider` } />,
				<MenuItem key={ id } />,
			] ) }
		</StyledPopoverMenu>
	);
}
