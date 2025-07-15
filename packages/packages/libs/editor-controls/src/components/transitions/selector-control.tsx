import * as React from 'react';
import { useState } from 'react';
import { PopoverBody, PopoverHeader, PopoverSearch } from '@elementor/editor-ui';
import { SettingsIcon } from '@elementor/icons';
import { Box, Divider, Link, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useFilteredTransitionProperties } from '../../hooks/use-filtered-transition-properties';
import { TransitionPropertyList } from './properties-list';

const SIZE = 'tiny';

type TransitionSelectorProps = {
	selectedProperty: string | null;
	onPropertyChange: ( property: string ) => void;
	onClose: () => void;
	sectionWidth: number;
	isProLicenseActive: boolean;
};

export const TransitionSelector = ( {
	selectedProperty,
	onPropertyChange,
	onClose,
	sectionWidth,
	isProLicenseActive,
}: TransitionSelectorProps ) => {
	const [ searchValue, setSearchValue ] = useState( '' );

	const filteredProperties = useFilteredTransitionProperties( searchValue, isProLicenseActive );

	const handleSearch = ( value: string ) => {
		setSearchValue( value );
	};

	const handleClose = () => {
		setSearchValue( '' );
		onClose();
	};

	return (
		<PopoverBody width={ sectionWidth }>
			<PopoverHeader
				title={ __( 'Transition Properties', 'elementor' ) }
				onClose={ handleClose }
				icon={ <SettingsIcon fontSize={ SIZE } /> }
			/>

			<PopoverSearch
				value={ searchValue }
				onSearch={ handleSearch }
				placeholder={ __( 'Search properties', 'elementor' ) }
			/>

			<Divider />

			{ filteredProperties.length > 0 ? (
				<TransitionPropertyList
					items={ filteredProperties }
					setProperty={ onPropertyChange }
					handleClose={ handleClose }
					selectedProperty={ selectedProperty }
				/>
			) : (
				<Stack
					alignItems="center"
					justifyContent="center"
					height="100%"
					p={ 2.5 }
					gap={ 1.5 }
					overflow={ 'hidden' }
				>
					<SettingsIcon fontSize="large" />
					<Box sx={ { maxWidth: 160, overflow: 'hidden' } }>
						<Typography align="center" variant="subtitle2" color="text.secondary">
							{ __( 'No properties found', 'elementor' ) }
						</Typography>
						<Typography
							variant="subtitle2"
							color="text.secondary"
							sx={ {
								display: 'flex',
								width: '100%',
								justifyContent: 'center',
							} }
						>
							<span>&ldquo;</span>
							<span style={ { maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis' } }>
								{ searchValue }
							</span>
							<span>&rdquo;</span>
						</Typography>
					</Box>
					<Typography
						align="center"
						variant="caption"
						color="text.secondary"
						sx={ { display: 'flex', flexDirection: 'column' } }
					>
						{ __( 'Try a different search term.', 'elementor' ) }
						<Link
							color="secondary"
							variant="caption"
							component="button"
							onClick={ () => setSearchValue( '' ) }
						>
							{ __( 'Clear & try again', 'elementor' ) }
						</Link>
					</Typography>
				</Stack>
			) }
		</PopoverBody>
	);
};
