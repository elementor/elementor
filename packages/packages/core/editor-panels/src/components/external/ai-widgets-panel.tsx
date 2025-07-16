import * as React from 'react';
import { useState } from 'react';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { createLocation } from '@elementor/locations';
import { getSessionStorageItem, setSessionStorageItem } from '@elementor/session';
import { Collapse, Divider, List, ListItemButton, ListItemText, type ListProps, Stack } from '@elementor/ui';

import { createPanel } from '../../api';
import { useElement } from '../../context/element-context';
import { SectionRefContext } from '../../context/section-context';
import { CollapseIcon } from './ai-panel-components/collapse-icon';
import Panel from './panel';
import PanelBody from './panel-body';
import PanelHeader from './panel-header';
import PanelHeaderTitle from './panel-header-title';

export const { inject: injectIntoAIWidgetsPanel, useInjections: useAIWidgetsPanelInjections } = createLocation();

const AIWidgetsPanelComponent = () => {
	const widgetInjections = useAIWidgetsPanelInjections();
	return (
		<Panel>
			<PanelHeader>
				<PanelHeaderTitle>{ 'AI Widgets' }</PanelHeaderTitle>
			</PanelHeader>
			<PanelBody>
				<SectionsList>
					<Section title={ 'Genie Widgets' } defaultExpanded>
					{ widgetInjections.map( ( injection, idx ) => (
						<React.Fragment key={ injection.id || idx }>
								<injection.component />
						</React.Fragment>
					) ) }
					</Section>
				</SectionsList>
			</PanelBody>
		</Panel>
	);
};

export const {
	panel: aiWidgetsPanel,
	usePanelActions: useAIWidgetsPanelActions,
	usePanelStatus: useAIWidgetsPanelStatus,
} = createPanel( {
	id: 'ai-widgets-panel',
	component: AIWidgetsPanelComponent,
} );

function SectionsList( props: ListProps ) {
	return <List disablePadding component="div" { ...props } />;
}

type Props = React.PropsWithChildren< {
	title: string;
	defaultExpanded?: boolean;
	titleEnd?: CollapsibleValue< React.ReactNode | string >;
} >;

function Section( { title, children, defaultExpanded = false, titleEnd }: Props ) {
	const [ isOpen, setIsOpen ] = useStateByElement( title, !! defaultExpanded );
	const ref = React.useRef< HTMLElement >( null );

	const handleClick = () => {
		setIsOpen( ! isOpen );
	};

	const id = React.useId();
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

type StaticItem< T = unknown > = T extends ( ...args: unknown[] ) => unknown ? never : T;

type CallbackItem< T > = ( isOpen: boolean ) => T;
export type CollapsibleValue< T > = CallbackItem< T > | StaticItem< T >;

function getCollapsibleValue< T >( value: CollapsibleValue< T >, isOpen: boolean ): T {
	if ( typeof value === 'function' ) {
		return ( value as CallbackItem< T > )( isOpen );
	}

	return value;
}

export const useStateByElement = < T, >( key: string, initialValue: T ) => {
	const { element } = useElement();
	const isFeatureActive = isExperimentActive( EXPERIMENTAL_FEATURES.V_3_30 );
	const lookup = `elementor/editor-state/${ element.id }/${ key }`;
	const storedValue = isFeatureActive ? getSessionStorageItem< T >( lookup ) : initialValue;
	const [ value, setValue ] = useState( storedValue ?? initialValue );

	const doUpdate = ( newValue: T ) => {
		setSessionStorageItem( lookup, newValue );
		setValue( newValue );
	};

	return [ value, doUpdate ] as const;
};

export const EXPERIMENTAL_FEATURES = {
	V_3_30: 'e_v_3_30',
	V_3_31: 'e_v_3_31',
};
