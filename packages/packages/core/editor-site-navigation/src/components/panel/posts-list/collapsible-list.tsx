import * as React from 'react';
import { type PropsWithChildren, type ReactNode } from 'react';
import { ChevronDownIcon } from '@elementor/icons';
import {
	Collapse,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Stack,
	styled,
	type SvgIconProps,
} from '@elementor/ui';

import { contentPanelInsetDividerSx, contentPanelInsetPaddingSx } from '../content-panel-chrome';

type Props = {
	label: string;
	isOpen: boolean;
	onOpenChange: ( isOpen: boolean ) => void;
	trailingActions?: ReactNode;
};

interface RotateIconProps extends SvgIconProps {
	isOpen: boolean;
}

const RotateIcon = styled( ChevronDownIcon, {
	shouldForwardProp: ( prop ) => prop !== 'isOpen',
} )< RotateIconProps >( ( { theme, isOpen } ) => ( {
	transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
	transition: theme.transitions.create( 'transform', {
		duration: theme.transitions.duration.standard,
	} ),
} ) );

export default function CollapsibleList( {
	label,
	isOpen,
	onOpenChange,
	trailingActions,
	children,
}: PropsWithChildren< Props > ) {
	const toggle = () => onOpenChange( ! isOpen );

	return (
		<>
			<ListItem
				dense
				secondaryAction={
					<Stack alignItems="center" direction="row" spacing={ 0.25 } sx={ { pr: 0.5 } }>
						<IconButton
							aria-expanded={ isOpen }
							onClick={ toggle }
							size="small"
							sx={ { color: 'text.secondary' } }
						>
							<RotateIcon fontSize="small" isOpen={ isOpen } />
						</IconButton>
						{ trailingActions }
					</Stack>
				}
				sx={ {
					...contentPanelInsetPaddingSx,
					py: 0.75,
				} }
			>
				<ListItemText
					primary={ label }
					primaryTypographyProps={ { variant: 'subtitle2', component: 'span' } }
					onClick={ toggle }
					sx={ { cursor: 'pointer', m: 0, userSelect: 'none' } }
				/>
			</ListItem>
			<Collapse in={ isOpen } timeout="auto" unmountOnExit>
				<List dense>{ children }</List>
			</Collapse>
			<Divider sx={ { mt: 1, ...contentPanelInsetDividerSx } } />
		</>
	);
}