import * as React from 'react';
import { type PropsWithChildren, type ReactNode, useId } from 'react';
import { CollapseIcon } from '@elementor/editor-ui';
import { Chip, Collapse, Divider, List, ListItemButton, ListItemText, Stack } from '@elementor/ui';

import { contentPanelSectionHeaderSx, contentPanelSectionHeaderTrailingGap } from '../content-panel-chrome';

type Props = {
	count: number;
	isOpen: boolean;
	onOpenChange: ( isOpen: boolean ) => void;
	title: string;
	trailingActions?: ReactNode;
};

const sectionHeaderListItemButtonSx = {
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
			<ListItemButton
				id={ labelId }
				aria-controls={ contentId }
				aria-expanded={ isOpen }
				aria-label={ sectionHeaderAriaLabel }
				disableRipple
				onClick={ handleClick }
				sx={ {
					...contentPanelSectionHeaderSx,
					...sectionHeaderListItemButtonSx,
				} }
			>
				<Stack alignItems="center" direction="row" flexGrow={ 1 } gap={ 0.5 } width="100%">
					<Stack
						alignItems="center"
						direction="row"
						flexGrow={ 1 }
						gap={ 0.5 }
						justifyContent="flex-start"
						minWidth={ 0 }
					>
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
					<Stack
						alignItems="center"
						direction="row"
						flexShrink={ 0 }
						gap={ contentPanelSectionHeaderTrailingGap }
						justifyContent="flex-end"
					>
						<CollapseIcon color="secondary" fontSize="tiny" open={ isOpen } />
						{ trailingActions && (
							<Stack
								alignItems="center"
								direction="row"
								onClick={ ( event: React.MouseEvent ) => event.stopPropagation() }
							>
								{ trailingActions }
							</Stack>
						) }
					</Stack>
				</Stack>
			</ListItemButton>
			<Collapse aria-labelledby={ labelId } id={ contentId } in={ isOpen } timeout="auto" unmountOnExit>
				<List dense disablePadding>
					{ children }
				</List>
			</Collapse>
			<Divider />
		</>
	);
}
