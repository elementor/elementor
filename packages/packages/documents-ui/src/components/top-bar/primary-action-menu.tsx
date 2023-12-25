import * as React from 'react';
import { styled } from '@elementor/ui';
import { documentOptionsMenu } from '../../menus';
import { Divider, PopoverMenu, PopoverMenuProps } from '@elementor/top-bar';

const { useMenuItems } = documentOptionsMenu;

// CSS hack to hide dividers when a group is rendered empty (due to a limitation in our locations' mechanism).
// It doesn't cover all the cases (i.e. when there are multiple dividers at the end), but it's good enough for our use-case.
const StyledPopoverMenu = styled( PopoverMenu )`
	& > .MuiPopover-paper > .MuiList-root > .MuiDivider-root {
		&:only-child, /* A divider is being rendered lonely */
		&:last-child, /* The last group renders empty but renders a divider */
		& + .MuiDivider-root /* Multiple dividers due to multiple empty groups */ {
			display: none;
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
			PaperProps={ {
				sx: { mt: 2, ml: 3 },
			} }
		>
			{ saveActions.map( ( { MenuItem, id }, index ) => ( [
				( index > 0 ) && <Divider key={ `${ id }-divider` } />,
				<MenuItem key={ id } />,
			] ) ) }

			{ defaultActions.length > 0 && <Divider /> }

			{ defaultActions.map( ( { MenuItem, id } ) => <MenuItem key={ id } /> ) }
		</StyledPopoverMenu>
	);
}
