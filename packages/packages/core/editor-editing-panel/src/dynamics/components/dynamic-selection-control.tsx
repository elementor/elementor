import * as React from 'react';
import { ControlFormLabel, useBoundProp } from '@elementor/editor-controls';
import type { Control, ControlsSection } from '@elementor/editor-elements';
import { PopoverHeader } from '@elementor/editor-ui';
import { DatabaseIcon, SettingsIcon, XIcon } from '@elementor/icons';
import {
	bindPopover,
	bindTrigger,
	Box,
	Divider,
	Grid,
	IconButton,
	Popover,
	Stack,
	Tab,
	TabPanel,
	Tabs,
	UnstableTag as Tag,
	usePopupState,
	useTabs,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PopoverBody } from '../../components/popover-body';
import { Control as BaseControl } from '../../controls-registry/control';
import { type ControlType, getControl } from '../../controls-registry/controls-registry';
import { usePersistDynamicValue } from '../../hooks/use-persist-dynamic-value';
import { DynamicControl } from '../dynamic-control';
import { useDynamicTag } from '../hooks/use-dynamic-tag';
import { type DynamicTag } from '../types';
import { dynamicPropTypeUtil } from '../utils';
import { DynamicSelection } from './dynamic-selection';

const SIZE = 'tiny';

export const DynamicSelectionControl = () => {
	const { setValue: setAnyValue } = useBoundProp();
	const { bind, value } = useBoundProp( dynamicPropTypeUtil );

	const [ propValueFromHistory ] = usePersistDynamicValue( bind );
	const selectionPopoverState = usePopupState( { variant: 'popover' } );

	const { name: tagName = '' } = value;

	const dynamicTag = useDynamicTag( tagName );

	const removeDynamicTag = () => {
		setAnyValue( propValueFromHistory ?? null );
	};

	if ( ! dynamicTag ) {
		throw new Error( `Dynamic tag ${ tagName } not found` );
	}

	return (
		<Box>
			<Tag
				fullWidth
				showActionsOnHover
				label={ dynamicTag.label }
				startIcon={ <DatabaseIcon fontSize={ SIZE } /> }
				{ ...bindTrigger( selectionPopoverState ) }
				actions={
					<>
						<DynamicSettingsPopover dynamicTag={ dynamicTag } />
						<IconButton
							size={ SIZE }
							onClick={ removeDynamicTag }
							aria-label={ __( 'Remove dynamic value', 'elementor' ) }
						>
							<XIcon fontSize={ SIZE } />
						</IconButton>
					</>
				}
			/>
			<Popover
				disablePortal
				disableScrollLock
				anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
				transformOrigin={ { vertical: 'top', horizontal: 'right' } }
				PaperProps={ {
					sx: { my: 1 },
				} }
				{ ...bindPopover( selectionPopoverState ) }
			>
				<PopoverBody>
					<DynamicSelection close={ selectionPopoverState.close } />
				</PopoverBody>
			</Popover>
		</Box>
	);
};

export const DynamicSettingsPopover = ( { dynamicTag }: { dynamicTag: DynamicTag } ) => {
	const popupState = usePopupState( { variant: 'popover' } );

	const hasDynamicSettings = !! dynamicTag.atomic_controls.length;

	if ( ! hasDynamicSettings ) {
		return null;
	}

	return (
		<>
			<IconButton size={ SIZE } { ...bindTrigger( popupState ) } aria-label={ __( 'Settings', 'elementor' ) }>
				<SettingsIcon fontSize={ SIZE } />
			</IconButton>
			<Popover
				disablePortal
				disableScrollLock
				anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
				transformOrigin={ { vertical: 'top', horizontal: 'right' } }
				PaperProps={ {
					sx: { my: 1 },
				} }
				{ ...bindPopover( popupState ) }
			>
				<PopoverBody>
					<PopoverHeader
						title={ dynamicTag.label }
						onClose={ popupState.close }
						icon={ <DatabaseIcon fontSize={ SIZE } /> }
					/>
					<DynamicSettings controls={ dynamicTag.atomic_controls } />
				</PopoverBody>
			</Popover>
		</>
	);
};

const DynamicSettings = ( { controls }: { controls: DynamicTag[ 'atomic_controls' ] } ) => {
	const tabs = controls.filter( ( { type } ) => type === 'section' ) as ControlsSection[];
	const { getTabsProps, getTabProps, getTabPanelProps } = useTabs< number >( 0 );

	if ( ! tabs.length ) {
		// Dynamic must have hierarchical controls.
		return null;
	}

	return (
		<>
			<Tabs size="small" variant="fullWidth" { ...getTabsProps() }>
				{ tabs.map( ( { value }, index ) => (
					<Tab key={ index } label={ value.label } sx={ { px: 1, py: 0.5 } } { ...getTabProps( index ) } />
				) ) }
			</Tabs>
			<Divider />

			{ tabs.map( ( { value }, index ) => {
				return (
					<TabPanel
						key={ index }
						sx={ { flexGrow: 1, py: 0, overflowY: 'auto' } }
						{ ...getTabPanelProps( index ) }
					>
						<Stack p={ 2 } gap={ 2 }>
							{ value.items.map( ( item ) => {
								if ( item.type === 'control' ) {
									return <Control key={ item.value.bind } control={ item.value } />;
								}
								return null;
							} ) }
						</Stack>
					</TabPanel>
				);
			} ) }
		</>
	);
};

const Control = ( { control }: { control: Control[ 'value' ] } ) => {
	if ( ! getControl( control.type as ControlType ) ) {
		return null;
	}

	return (
		<DynamicControl bind={ control.bind }>
			<Grid container gap={ 0.75 }>
				{ control.label ? (
					<Grid item xs={ 12 }>
						<ControlFormLabel>{ control.label }</ControlFormLabel>
					</Grid>
				) : null }
				<Grid item xs={ 12 }>
					<BaseControl type={ control.type as ControlType } props={ control.props } />
				</Grid>
			</Grid>
		</DynamicControl>
	);
};
