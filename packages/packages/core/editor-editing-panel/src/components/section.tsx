import * as React from 'react';
import { type PropsWithChildren, type ReactNode, useId, useRef } from 'react';
import { CollapseIcon } from '@elementor/editor-ui';
import { Collapse, Divider, ListItemButton, ListItemText, Stack } from '@elementor/ui';

import { SectionRefContext } from '../contexts/section-context';
import { useStateByElement } from '../hooks/use-state-by-element';
import { type CollapsibleValue, getCollapsibleValue } from './collapsible-content';

type Props = PropsWithChildren< {
	title: string;
	defaultExpanded?: boolean;
	titleEnd?: CollapsibleValue< ReactNode | string >;
	unmountOnExit?: boolean;
	action?: { component: ReactNode; onClick: () => void };
} >;

export function Section( { title, children, defaultExpanded = false, titleEnd, unmountOnExit = true, action }: Props ) {
	const [ isOpen, setIsOpen ] = useStateByElement( title, !! defaultExpanded );
	const ref = useRef< HTMLElement >( null );
	const isDisabled = !! action;

	const handleClick = () => {
		if ( isDisabled ) {
			action?.onClick();
		} else {
			setIsOpen( ! isOpen );
		}
	};

	const id = useId();
	const labelId = `label-${ id }`;
	const contentId = `content-${ id }`;

	return (
		<>
			<ListItemButton
				id={ labelId }
				aria-controls={ contentId }
				aria-label={ `${ title } section` }
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
				{ action?.component }
				<CollapseIcon
					open={ isOpen }
					color="secondary"
					fontSize="tiny"
					disabled={ isDisabled }
					sx={ { ml: 1 } }
				/>
			</ListItemButton>
			<Collapse
				id={ contentId }
				aria-labelledby={ labelId }
				in={ isOpen }
				timeout="auto"
				unmountOnExit={ unmountOnExit }
			>
				<SectionRefContext.Provider value={ ref }>
					<Stack ref={ ref } gap={ 2.5 } p={ 2 } aria-label={ `${ title } section content` }>
						{ children }
					</Stack>
				</SectionRefContext.Provider>
			</Collapse>
			<Divider />
		</>
	);
}
