import * as React from 'react';
import { useRef } from 'react';
import { SearchIcon, XIcon } from '@elementor/icons';
import { Box, IconButton, InputAdornment, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const SIZE = 'tiny';

type Props = {
	value: string;
	onSearch: ( search: string ) => void;
	placeholder: string;
};

export const PopoverSearch = ( { value, onSearch, placeholder }: Props ) => {
	const inputRef = useRef< HTMLInputElement | null >( null );

	const handleClear = () => {
		onSearch( '' );

		inputRef.current?.focus();
	};

	const handleInputChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		onSearch( event.target.value );
	};

	return (
		<Box sx={ { px: 2, pb: 1.5 } }>
			<TextField
				// eslint-disable-next-line jsx-a11y/no-autofocus
				autoFocus
				fullWidth
				size={ SIZE }
				value={ value }
				inputRef={ inputRef }
				onChange={ handleInputChange }
				placeholder={ placeholder }
				InputProps={ {
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon fontSize={ SIZE } />
						</InputAdornment>
					),
					endAdornment: value && (
						<IconButton size={ SIZE } onClick={ handleClear } aria-label={ __( 'Clear', 'elementor' ) }>
							<XIcon color="action" fontSize={ SIZE } />
						</IconButton>
					),
				} }
			/>
		</Box>
	);
};
