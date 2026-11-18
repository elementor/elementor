import * as React from 'react';
import { type PropsWithChildren, type ReactNode, useId } from 'react';
import { CollapseIcon } from '@elementor/editor-ui';
import { Chip, Collapse, Divider, List, ListItemButton, ListItemText, Stack } from '@elementor/ui';

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
				sx={ sectionHeaderListItemButtonSx }
			>
				<Stack alignItems="center" direction="row" flexGrow={ 1 } gap={ 0.5 } justifyItems="start">
					<ListItemText
						secondary={ title }
						secondaryTypographyProps={ { color: 'text.primary', fontWeight: 'bold', variant: 'caption' } }
						sx={ { flexGrow: 0, flexShrink: 1, marginInlineEnd: 1 } }
					/>
					<Chip label={ count } size="tiny" />
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
				<CollapseIcon color="secondary" fontSize="tiny" open={ isOpen } sx={ { ml: 1 } } />
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
