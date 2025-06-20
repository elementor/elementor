import * as React from 'react';
import { createContext, type PropsWithChildren, type ReactNode, useContext, useId, useRef } from 'react';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { Collapse, Divider, ListItemButton, ListItemText, Stack } from '@elementor/ui';

import { useStateByElement } from '../hooks/use-state-by-element';
import { EXPERIMENTAL_FEATURES } from '../sync/experiments-flags';
import { CollapseIcon } from './collapse-icon';
import { type CollapsibleValue, getCollapsibleValue } from './collapsible-content';

const SectionRefContext = createContext< React.RefObject< HTMLElement > | null >( null );

export const useSectionRef = () => useContext( SectionRefContext );

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

	const isUsingTitleEnd = isExperimentActive( EXPERIMENTAL_FEATURES.V_3_30 );

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
					{ isUsingTitleEnd ? getCollapsibleValue( titleEnd, isOpen ) : null }
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
