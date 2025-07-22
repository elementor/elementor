import * as React from 'react';
import { type PropsWithChildren, type ReactNode, useId, useRef } from 'react';
import { Collapse, Divider, ListItemButton, ListItemText, Stack } from '@elementor/ui';

import { SectionRefContext } from '../contexts/section-context';
import { useStateByElement } from '../hooks/use-state-by-element';
import { CollapseIcon } from './collapse-icon';
import { type CollapsibleValue, getCollapsibleValue } from './collapsible-content';

type Props = PropsWithChildren< {
	title: string;
	defaultExpanded?: boolean;
	titleEnd?: CollapsibleValue< ReactNode | string >;
} >;

export function Section( { title, children, defaultExpanded = false, titleEnd }: Props ) {
	const [ isOpen, setIsOpen ] = useStateByElement( title, !! defaultExpanded );
	const ref = useRef< HTMLElement >( null );

	const handleClick = () => {
		setIsOpen( ! isOpen );
	};

	const id = useId();
	const labelId = `label-${ id }`;
	const contentId = `content-${ id }`;

	return (
		<>
			<ListItemButton
				id={ labelId }
				aria-controls={ contentId }
				onClick={ handleClick }
				sx={ { '&:hover': { backgroundColor: 'transparent' } } }
			>
				<Stack direction="row" alignItems="center" justifyItems="start" flexGrow={ 1 } gap={ 0.5 }>
					<ListItemText
						secondary={ title }
						secondaryTypographyProps={ { color: 'text.primary', variant: 'caption', fontWeight: 'bold' } }
						sx={ { flexGrow: 0, flexShrink: 1, marginInlineEnd: 1 } }
					/>
					{ getCollapsibleValue( titleEnd, isOpen ) }
				</Stack>
				<CollapseIcon open={ isOpen } color="secondary" fontSize="tiny" />
			</ListItemButton>
			<Collapse id={ contentId } aria-labelledby={ labelId } in={ isOpen } timeout="auto" unmountOnExit>
				<SectionRefContext.Provider value={ ref }>
					<Stack ref={ ref } gap={ 2.5 } p={ 2 }>
						{ children }
					</Stack>
				</SectionRefContext.Provider>
			</Collapse>
			<Divider />
		</>
	);
}
