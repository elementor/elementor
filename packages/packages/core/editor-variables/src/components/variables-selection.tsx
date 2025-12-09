import * as React from 'react';
import { useState } from 'react';
import { PopoverBody } from '@elementor/editor-editing-panel';
import { PopoverHeader, PopoverMenuList, SearchField, type VirtualizedItem } from '@elementor/editor-ui';
import { ColorFilterIcon, PlusIcon, SettingsIcon } from '@elementor/icons';
import { Divider, IconButton, Tooltip } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { useVariableType } from '../context/variable-type-context';
import { useFilteredVariables } from '../hooks/use-prop-variables';
import { useVariableBoundProp } from '../hooks/use-variable-bound-prop';
import { type ExtendedVirtualizedItem } from '../types';
import { trackVariableEvent, trackVariablesManagerEvent } from '../utils/tracking';
import { EmptyState } from './ui/empty-state';
import { MenuItemContent } from './ui/menu-item-content';
import { NoSearchResults } from './ui/no-search-results';
import { VariablesStyledMenuList } from './ui/styled-menu-list';

const SIZE = 'tiny';
const CREATE_LABEL = __( 'Create variable', 'elementor' );
const MANAGER_LABEL = __( 'Variables Manager', 'elementor' );

type Props = {
	closePopover: () => void;
	onAdd?: () => void;
	onEdit?: ( key: string ) => void;
	onSettings?: () => void;
};

export const VariablesSelection = ( { closePopover, onAdd, onEdit, onSettings }: Props ) => {
	const {
		icon: VariableIcon,
		startIcon,
		variableType,
		propTypeUtil,
		isUpgradeRequired,
		upgradeUrl,
	} = useVariableType();

	const { value: variable, setValue: setVariable, path } = useVariableBoundProp();
	const [ searchValue, setSearchValue ] = useState( '' );

	const {
		list: variables,
		hasMatches: hasSearchResults,
		isSourceNotEmpty: hasVariables,
		hasNoCompatibleVariables,
	} = useFilteredVariables( searchValue, propTypeUtil.key );

	const handleSetVariable = ( key: string ) => {
		setVariable( key );
		trackVariableEvent( {
			varType: variableType,
			controlPath: path.join( '.' ),
			action: 'connect',
		} );
		closePopover();
	};

	const onAddAndTrack = () => {
		onAdd?.();
		trackVariableEvent( {
			varType: variableType,
			controlPath: path.join( '.' ),
			action: 'add',
		} );
	};

	const actions = [];

	if ( onAdd ) {
		actions.push(
			<Tooltip key="add" placement="top" title={ CREATE_LABEL }>
				<IconButton
					id="add-variable-button"
					size={ SIZE }
					onClick={ onAddAndTrack }
					aria-label={ CREATE_LABEL }
					disabled={ isUpgradeRequired }
				>
					<PlusIcon fontSize={ SIZE } />
				</IconButton>
			</Tooltip>
		);
	}

	if ( onSettings ) {
		const handleOpenManager = () => {
			onSettings();
			trackVariablesManagerEvent( {
				action: 'openManager',
				varType: variableType,
				controlPath: path.join( '.' ),
			} );
		};

		actions.push(
			<Tooltip key="settings" placement="top" title={ MANAGER_LABEL }>
				<IconButton
					id="variables-manager-button"
					size={ SIZE }
					onClick={ handleOpenManager }
					aria-label={ MANAGER_LABEL }
				>
					<SettingsIcon fontSize={ SIZE } />
				</IconButton>
			</Tooltip>
		);
	}

	const StartIcon = startIcon || ( () => <VariableIcon fontSize={ SIZE } /> );

	const items: ExtendedVirtualizedItem[] = variables.map( ( { value, label, key } ) => ( {
		type: 'item' as const,
		value: key,
		label,
		icon: <StartIcon value={ value } />,
		secondaryText: value,
		onEdit: onEdit ? () => onEdit?.( key ) : undefined,
	} ) );

	const handleSearch = ( search: string ) => {
		setSearchValue( search );
	};

	const handleClearSearch = () => {
		setSearchValue( '' );
	};

	const noVariableTitle = isUpgradeRequired
		? sprintf(
				/* translators: %s: Variable Type. */
				__( 'No %s variables yet', 'elementor' ),
				variableType
		  )
		: sprintf(
				/* translators: %s: Variable Type. */
				__( 'Create your first %s variable', 'elementor' ),
				variableType
		  );

	const noVariableMessage = isUpgradeRequired
		? /* translators: %s: Variable Type. */
		  sprintf(
				__(
					'Start by creating your first %s variable to apply consistent sizing across elements.',
					'elementor'
				),
				variableType
		  )
		: __( 'Variables are saved attributes that you can apply anywhere on your site.', 'elementor' );

	return (
		<PopoverBody>
			<PopoverHeader
				title={ __( 'Variables', 'elementor' ) }
				icon={ <ColorFilterIcon fontSize={ SIZE } /> }
				onClose={ closePopover }
				actions={ actions }
			/>

			{ hasVariables && (
				<SearchField
					value={ searchValue }
					onSearch={ handleSearch }
					placeholder={ __( 'Search', 'elementor' ) }
				/>
			) }

			<Divider />

			{ hasVariables && hasSearchResults && (
				<PopoverMenuList
					items={ items }
					onSelect={ handleSetVariable }
					onClose={ () => {} }
					selectedValue={ variable }
					data-testid={ `${ variableType }-variables-list` }
					menuListTemplate={ VariablesStyledMenuList }
					menuItemContentTemplate={ ( item: VirtualizedItem< 'item', string > ) => (
						<MenuItemContent item={ item } />
					) }
				/>
			) }

			{ ! hasSearchResults && hasVariables && (
				<NoSearchResults
					searchValue={ searchValue }
					onClear={ handleClearSearch }
					icon={ <VariableIcon fontSize="large" /> }
				/>
			) }

			{ ! hasVariables && ! hasNoCompatibleVariables && (
				<EmptyState
					title={ noVariableTitle }
					message={ noVariableMessage }
					icon={ <VariableIcon fontSize="large" /> }
					onAdd={ isUpgradeRequired ? undefined : onAdd }
					upgradeUrl={ upgradeUrl }
				/>
			) }

			{ hasNoCompatibleVariables && (
				<EmptyState
					title={ __( 'No compatible variables', 'elementor' ) }
					message={ __(
						'Looks like none of your variables work with this control. Create a new variable to use it here.',
						'elementor'
					) }
					icon={ <VariableIcon fontSize="large" /> }
					onAdd={ isUpgradeRequired ? undefined : onAdd }
					upgradeUrl={ upgradeUrl }
				/>
			) }
		</PopoverBody>
	);
};
