import * as React from 'react';
import { useState } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { PopoverBody } from '@elementor/editor-editing-panel';
import { PopoverHeader, PopoverMenuList, PopoverSearch, type VirtualizedItem } from '@elementor/editor-ui';
import { ColorFilterIcon, PlusIcon, SettingsIcon } from '@elementor/icons';
import { Divider, IconButton } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { useVariableType } from '../context/variable-type-context';
import { useFilteredVariables } from '../hooks/use-prop-variables';
import { type ExtendedVirtualizedItem } from '../types';
import { trackVariableEvent } from '../utils/tracking';
import { EmptyState } from './ui/empty-state';
import { MenuItemContent } from './ui/menu-item-content';
import { NoSearchResults } from './ui/no-search-results';
import { VariablesStyledMenuList } from './ui/styled-menu-list';

const SIZE = 'tiny';

type Props = {
	closePopover: () => void;
	onAdd?: () => void;
	onEdit?: ( key: string ) => void;
	onSettings?: () => void;
};

export const VariablesSelection = ( { closePopover, onAdd, onEdit, onSettings }: Props ) => {
	const { icon: VariableIcon, startIcon, variableType, propTypeUtil } = useVariableType();

	const { value: variable, setValue: setVariable, path } = useBoundProp( propTypeUtil );
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
			<IconButton key="add" size={ SIZE } onClick={ onAddAndTrack }>
				<PlusIcon fontSize={ SIZE } />
			</IconButton>
		);
	}

	if ( onSettings ) {
		actions.push(
			<IconButton key="settings" size={ SIZE } onClick={ onSettings }>
				<SettingsIcon fontSize={ SIZE } />
			</IconButton>
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

	const noVariableTitle = sprintf(
		/* translators: %s: Variable Type. */
		__( 'Create your first %s variable', 'elementor' ),
		variableType
	);

	return (
		<PopoverBody>
			<PopoverHeader
				title={ __( 'Variables', 'elementor' ) }
				icon={ <ColorFilterIcon fontSize={ SIZE } /> }
				onClose={ closePopover }
				actions={ actions }
			/>

			{ hasVariables && (
				<PopoverSearch
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
					message={ __(
						'Variables are saved attributes that you can apply anywhere on your site.',
						'elementor'
					) }
					icon={ <VariableIcon fontSize="large" /> }
					onAdd={ onAdd }
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
					onAdd={ onAdd }
				/>
			) }
		</PopoverBody>
	);
};
