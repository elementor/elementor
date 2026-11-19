import * as React from 'react';
import { type PropsWithChildren, type ReactNode, useId } from 'react';
import { CollapseIcon } from '@elementor/editor-ui';
import { Box, Chip, Collapse, Divider, List, ListItemButton, ListItemText, Stack } from '@elementor/ui';

import {
	contentPanelListSectionListSx,
	contentPanelSectionHeaderSx,
	contentPanelSectionHeaderTrailingGap,
} from '../content-panel-chrome';

type Props = {
	count: number;
	isOpen: boolean;
	onOpenChange: ( isOpen: boolean ) => void;
	title: string;
	trailingActions?: ReactNode;
};

const sectionHeaderListItemButtonSx = {
	flexGrow: 1,
	minWidth: 0,
	'&:focus': { backgroundColor: 'transparent' },
	'&:hover': { backgroundColor: 'transparent' },
	'&.Mui-focusVisible': { backgroundColor: 'transparent' },
};

function getSectionHeaderAriaLabel( title: string, count: number ) {
	return `${ title } (${ count.toString() })`;
}

export default function CollapsibleList( {
	count,
	isOpen,
	onOpenChange,
	title,
	trailingActions,
	children,
}: PropsWithChildren< Props > ) {
	const id = useId();
	const labelId = `label-${ id }`;
	const contentId = `content-${ id }`;
	const sectionHeaderAriaLabel = getSectionHeaderAriaLabel( title, count );

	const handleClick = () => onOpenChange( ! isOpen );

	return (
		<>
			<Box
				sx={ {
					...contentPanelSectionHeaderSx,
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'row',
					width: '100%',
				} }
			>
				<ListItemButton
					id={ labelId }
					aria-controls={ contentId }
					aria-expanded={ isOpen }
					aria-label={ sectionHeaderAriaLabel }
					disableRipple
					onClick={ handleClick }
					sx={ sectionHeaderListItemButtonSx }
				>
					<Stack alignItems="center" direction="row" flexGrow={ 1 } gap={ 0.5 } minWidth={ 0 } width="100%">
						<Stack alignItems="center" direction="row" flex={ 1 } gap={ 0.5 } minWidth={ 0 }>
							<ListItemText
								secondary={ title }
								secondaryTypographyProps={ {
									color: 'text.primary',
									fontWeight: 'bold',
									variant: 'caption',
								} }
								sx={ { flexGrow: 0, flexShrink: 1, marginInlineEnd: 1 } }
							/>
							<Chip label={ count } size="tiny" />
						</Stack>
						<CollapseIcon color="secondary" fontSize="tiny" open={ isOpen } sx={ { flexShrink: 0 } } />
					</Stack>
				</ListItemButton>
				{ trailingActions && (
					<Stack
						alignItems="center"
						direction="row"
						flexShrink={ 0 }
						gap={ contentPanelSectionHeaderTrailingGap }
						sx={ { marginInlineStart: 0.5 } }
					>
						{ trailingActions }
					</Stack>
				) }
			</Box>
			<Collapse aria-labelledby={ labelId } id={ contentId } in={ isOpen } timeout="auto" unmountOnExit>
				<List dense disablePadding sx={ contentPanelListSectionListSx }>
					{ children }
				</List>
			</Collapse>
			<Divider />
		</>
	);
}
