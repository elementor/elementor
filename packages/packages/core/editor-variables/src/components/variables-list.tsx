import { useState } from 'react';
import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { PopoverBody } from '@elementor/editor-editing-panel';
import type { PropTypeUtil } from '@elementor/editor-props';
import { PopoverHeader, PopoverMenuList, PopoverSearch, type VirtualizedItem } from '@elementor/editor-ui';
import { ColorFilterIcon, PlusIcon, SettingsIcon } from '@elementor/icons';
import { Divider, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useFilteredVariables } from '../hooks/use-prop-variables';
import type { ExtendedVirtualizedItem } from '../types';
import { trackVariableEvent } from '../utils/tracking';
import { getVariable } from '../variable-registry';
import { MenuItemContent } from './ui/menu-item-content';
import { NoSearchResults } from './ui/no-search-results';
import { NoVariables } from './ui/no-variables';
import { VariablesStyledMenuList } from './ui/styled-menu-list';

const SIZE = 'tiny';

type Props = {
	closePopover: () => void;
	onAdd?: () => void;
	onEdit?: ( key: string ) => void;
	onSettings?: () => void;
	propTypeUtil: PropTypeUtil< string, string >;
};

export const VariablesList = ( { closePopover, onAdd, onEdit, onSettings, propTypeUtil }: Props ) => {
	const { value: variable, setValue: setVariable, path } = useBoundProp( propTypeUtil );
	const [ searchValue, setSearchValue ] = useState( '' );

	const { icon: VariableIcon, listIcon: ListIcon, variableType } = getVariable( propTypeUtil.key );

	const {
		list: variables,
		hasMatches: hasSearchResults,
		isSourceNotEmpty: hasVariables,
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

	const items: ExtendedVirtualizedItem[] = variables.map( ( { value, label, key } ) => ( {
		type: 'item' as const,
		value: key,
		label,
		icon: <ListIcon value={ value } />,
		secondaryText: value,
		onEdit: onEdit ? () => onEdit?.( key ) : undefined,
	} ) );

	const handleSearch = ( search: string ) => {
		setSearchValue( search );
	};

	const handleClearSearch = () => {
		setSearchValue( '' );
	};

	const noVariableTitle = `Create your first ${ variableType } variable`;
	const popoverTestId = `${ variableType }-variables-list`;

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
					data-testid={ popoverTestId }
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

			{ ! hasVariables && (
				<NoVariables title={ noVariableTitle } icon={ <VariableIcon fontSize="large" /> } onAdd={ onAdd } />
			) }
		</PopoverBody>
	);
};
