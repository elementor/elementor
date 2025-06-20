import * as React from 'react';
import { useState } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { useSectionRef } from '@elementor/editor-editing-panel';
import {
	PopoverHeader,
	PopoverMenuList,
	PopoverScrollableContent,
	PopoverSearch,
	type VirtualizedItem,
} from '@elementor/editor-ui';
import { BrushIcon, ColorFilterIcon, PlusIcon, SettingsIcon } from '@elementor/icons';
import { Divider, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useFilteredVariables } from '../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../prop-types/color-variable-prop-type';
import { type ExtendedVirtualizedItem } from '../types';
import { ColorIndicator } from './ui/color-indicator';
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

export const ColorVariablesSelection = ( { closePopover, onAdd, onEdit, onSettings }: Props ) => {
	const { value: variable, setValue: setVariable } = useBoundProp( colorVariablePropTypeUtil );
	const [ searchValue, setSearchValue ] = useState( '' );

	const {
		list: variables,
		hasMatches: hasSearchResults,
		isSourceNotEmpty: hasVariables,
	} = useFilteredVariables( searchValue, colorVariablePropTypeUtil.key );

	const handleSetColorVariable = ( key: string ) => {
		setVariable( key );
		closePopover();
	};

	const actions = [];

	if ( onAdd ) {
		actions.push(
			<IconButton key="add" size={ SIZE } onClick={ onAdd }>
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
		icon: <ColorIndicator size="inherit" component="span" value={ value } />,
		secondaryText: value,
		onEdit: () => onEdit?.( key ),
	} ) );

	const handleSearch = ( search: string ) => {
		setSearchValue( search );
	};

	const handleClearSearch = () => {
		setSearchValue( '' );
	};

	const sectionRef = useSectionRef();
	const sectionWidth = sectionRef?.current?.offsetWidth ?? 320;

	return (
		<>
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
				<PopoverMenuList< 'item', string >
					items={ items }
					onSelect={ handleSetColorVariable }
					onClose={ () => {} }
					selectedValue={ variable }
					data-testid="color-variables-list"
					menuListTemplate={ VariablesStyledMenuList }
					menuItemContentTemplate={ ( item: VirtualizedItem< 'item', string > ) => (
						<MenuItemContent item={ item } />
					) }
					width={ sectionWidth }
				/>
			) }

			{ ! hasSearchResults && hasVariables && (
				<PopoverScrollableContent width={ sectionWidth }>
					<NoSearchResults searchValue={ searchValue } onClear={ handleClearSearch } />
				</PopoverScrollableContent>
			) }

			{ ! hasVariables && (
				<PopoverScrollableContent width={ sectionWidth }>
					<NoVariables
						title={ __( 'Create your first color variable', 'elementor' ) }
						icon={ <BrushIcon fontSize="large" /> }
						onAdd={ onAdd }
					/>
				</PopoverScrollableContent>
			) }
		</>
	);
};
