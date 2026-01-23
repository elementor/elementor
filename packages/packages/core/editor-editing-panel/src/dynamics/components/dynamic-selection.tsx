import { Fragment, useState } from 'react';
import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { CtaButton, PopoverHeader, PopoverMenuList, SearchField, SectionPopoverBody } from '@elementor/editor-ui';
import { DatabaseIcon } from '@elementor/icons';
import { Divider, Link, Stack, Typography, useTheme } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { usePersistDynamicValue } from '../../hooks/use-persist-dynamic-value';
import { usePropDynamicTags } from '../hooks/use-prop-dynamic-tags';
import { getAtomicDynamicTags } from '../sync/get-atomic-dynamic-tags';
import { dynamicPropTypeUtil } from '../utils';

type Option = {
	label: string;
	value: string;
	group: string;
};

type OptionEntry = [ string, Option[] ];

const SIZE = 'tiny';
const PROMO_TEXT_WIDTH = 170;
const PRO_DYNAMIC_TAGS_URL = 'https://go.elementor.com/go-pro-dynamic-tags-modal/';
const RENEW_DYNAMIC_TAGS_URL = 'https://go.elementor.com/go-pro-dynamic-tags-renew-modal/';

type DynamicSelectionProps = {
	close: () => void;
	expired?: boolean;
};

type NoResultsProps = {
	searchValue: string;
	onClear?: () => void;
};

export const DynamicSelection = ( { close: closePopover, expired = false }: DynamicSelectionProps ) => {
	const [ searchValue, setSearchValue ] = useState( '' );
	const { groups: dynamicGroups } = getAtomicDynamicTags() || {};
	const theme = useTheme();

	const { value: anyValue } = useBoundProp();
	const { bind, value: dynamicValue, setValue } = useBoundProp( dynamicPropTypeUtil );

	const [ , updatePropValueHistory ] = usePersistDynamicValue( bind );

	const isCurrentValueDynamic = !! dynamicValue;

	const options = useFilteredOptions( searchValue );

	const hasNoDynamicTags = ! options.length && ! searchValue.trim();

	const handleSearch = ( value: string ) => {
		setSearchValue( value );
	};

	const handleSetDynamicTag = ( value: string ) => {
		if ( ! isCurrentValueDynamic ) {
			updatePropValueHistory( anyValue );
		}

		const selectedOption = options.flatMap( ( [ , items ] ) => items ).find( ( item ) => item.value === value );

		setValue( { name: value, group: selectedOption?.group ?? '', settings: { label: selectedOption?.label } } );

		closePopover();
	};

	const virtualizedItems = options.flatMap( ( [ category, items ] ) => [
		{
			type: 'category' as const,
			value: category,
			label: dynamicGroups?.[ category ]?.title || category,
		},
		...items.map( ( item ) => ( {
			type: 'item' as const,
			value: item.value,
			label: item.label,
		} ) ),
	] );

	const getPopOverContent = () => {
		if ( hasNoDynamicTags ) {
			return <NoDynamicTags />;
		}

		if ( expired ) {
			return <ExpiredDynamicTags />;
		}

		return (
			<Fragment>
				<SearchField
					value={ searchValue }
					onSearch={ handleSearch }
					placeholder={ __( 'Search dynamic tags…', 'elementor' ) }
				/>

				<Divider />

				<PopoverMenuList
					items={ virtualizedItems }
					onSelect={ handleSetDynamicTag }
					onClose={ closePopover }
					selectedValue={ dynamicValue?.name }
					itemStyle={ ( item ) =>
						item.type === 'item' ? { paddingInlineStart: theme.spacing( 3.5 ) } : {}
					}
					noResultsComponent={
						<NoResults searchValue={ searchValue } onClear={ () => setSearchValue( '' ) } />
					}
				/>
			</Fragment>
		);
	};

	return (
		<SectionPopoverBody aria-label={ __( 'Dynamic tags', 'elementor' ) }>
			<PopoverHeader
				title={ __( 'Dynamic tags', 'elementor' ) }
				onClose={ closePopover }
				icon={ <DatabaseIcon fontSize={ SIZE } /> }
			/>
			{ getPopOverContent() }
		</SectionPopoverBody>
	);
};

const NoResults = ( { searchValue, onClear }: NoResultsProps ) => (
	<Stack
		gap={ 1 }
		alignItems="center"
		justifyContent="center"
		height="100%"
		p={ 2.5 }
		color="text.secondary"
		sx={ { pb: 3.5 } }
	>
		<DatabaseIcon fontSize="large" />
		<Typography align="center" variant="subtitle2">
			{ __( 'Sorry, nothing matched', 'elementor' ) }
			<br />
			&ldquo;{ searchValue }&rdquo;.
		</Typography>
		<Typography align="center" variant="caption" sx={ { display: 'flex', flexDirection: 'column' } }>
			{ __( 'Try something else.', 'elementor' ) }
			<Link color="text.secondary" variant="caption" component="button" onClick={ onClear }>
				{ __( 'Clear & try again', 'elementor' ) }
			</Link>
		</Typography>
	</Stack>
);

const NoDynamicTags = () => (
	<>
		<Divider />
		<Stack
			gap={ 1 }
			alignItems="center"
			justifyContent="center"
			height="100%"
			p={ 2.5 }
			color="text.secondary"
			sx={ { pb: 3.5 } }
		>
			<DatabaseIcon fontSize="large" />
			<Typography align="center" variant="subtitle2">
				{ __( 'Streamline your workflow with dynamic tags', 'elementor' ) }
			</Typography>
			<Typography align="center" variant="caption" width={ PROMO_TEXT_WIDTH }>
				{ __( 'Upgrade now to display your content dynamically.', 'elementor' ) }
			</Typography>
			<CtaButton size="small" href={ PRO_DYNAMIC_TAGS_URL } />
		</Stack>
	</>
);

const ExpiredDynamicTags = () => (
	<>
		<Divider />
		<Stack
			gap={ 1 }
			alignItems="center"
			justifyContent="center"
			height="100%"
			p={ 2.5 }
			color="text.secondary"
			sx={ { pb: 3.5 } }
		>
			<DatabaseIcon fontSize="large" />
			<Typography align="center" variant="subtitle2">
				{ __( 'Unlock your Dynamic tags again', 'elementor' ) }
			</Typography>
			<Typography align="center" variant="caption" width={ PROMO_TEXT_WIDTH }>
				{ __( 'Dynamic tags need Elementor Pro. Renew now to keep them active.', 'elementor' ) }
			</Typography>
			<CtaButton size="small" href={ RENEW_DYNAMIC_TAGS_URL } children={ __( 'Renew Now', 'elementor' ) } />
		</Stack>
	</>
);

const useFilteredOptions = ( searchValue: string ): OptionEntry[] => {
	const dynamicTags = usePropDynamicTags();

	const options = dynamicTags.reduce< Map< string, Option[] > >( ( categories, { name, label, group } ) => {
		const isVisible = label.toLowerCase().includes( searchValue.trim().toLowerCase() );

		if ( ! isVisible ) {
			return categories;
		}

		if ( ! categories.has( group ) ) {
			categories.set( group, [] );
		}

		categories.get( group )?.push( { label, group, value: name } );

		return categories;
	}, new Map() );

	return [ ...options ];
};
