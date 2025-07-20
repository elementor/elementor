import * as React from 'react';
import { useState } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { PopoverBody } from '@elementor/editor-editing-panel';
import { PopoverHeader, PopoverMenuList, PopoverSearch, type VirtualizedItem } from '@elementor/editor-ui';
import { ColorFilterIcon, PlusIcon, SettingsIcon, TextIcon } from '@elementor/icons';
import { Divider, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useFilteredVariables } from '../hooks/use-prop-variables';
import { fontVariablePropTypeUtil } from '../prop-types/font-variable-prop-type';
import { type ExtendedVirtualizedItem } from '../types';
import { trackVariableEvent } from '../utils/tracking';
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
};

export const FontVariablesSelection = ( { closePopover, onAdd, onEdit, onSettings }: Props ) => {
	const { value: variable, setValue: setVariable, path } = useBoundProp( fontVariablePropTypeUtil );
	const [ searchValue, setSearchValue ] = useState( '' );

	const {
		list: variables,
		hasMatches: hasSearchResults,
		isSourceNotEmpty: hasVariables,
	} = useFilteredVariables( searchValue, fontVariablePropTypeUtil.key );

	const handleSetVariable = ( key: string ) => {
		setVariable( key );
		trackVariableEvent( {
			varType: 'font',
			controlPath: path.join( '.' ),
			action: 'connect',
		} );
		closePopover();
	};

	const onAddAndTrack = () => {
		onAdd?.();
		trackVariableEvent( {
			varType: 'font',
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
		icon: <TextIcon fontSize={ SIZE } />,
		secondaryText: value,
		onEdit: onEdit ? () => onEdit?.( key ) : undefined,
	} ) );

	const handleSearch = ( search: string ) => {
		setSearchValue( search );
	};

	const handleClearSearch = () => {
		setSearchValue( '' );
	};

	return (
		<PopoverBody>
			<PopoverHeader
				title={ __( 'Variables', 'elementor' ) }
				onClose={ closePopover }
				icon={ <ColorFilterIcon fontSize={ SIZE } /> }
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
					data-testid="font-variables-list"
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
					icon={ <TextIcon fontSize="large" /> }
				/>
			) }

			{ ! hasVariables && (
				<NoVariables
					title={ __( 'Create your first font variable', 'elementor' ) }
					icon={ <TextIcon fontSize="large" /> }
					onAdd={ onAdd }
				/>
			) }
		</PopoverBody>
	);
};
