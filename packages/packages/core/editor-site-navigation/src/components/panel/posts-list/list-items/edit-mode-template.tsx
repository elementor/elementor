import * as React from 'react';
import { type FocusEvent, type FormEvent, type MutableRefObject, useRef, useState } from 'react';
import { XIcon } from '@elementor/icons';
import { Box, CircularProgress, IconButton, ListItem, ListItemText, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { usePostListContext } from '../../../../contexts/post-list-context';
import {
	contentPanelListItemButtonSx,
	contentPanelListRowPaddingSx,
	contentPanelListRowTitleSx,
} from '../../content-panel-chrome';

type Props = {
	postTitle: string;
	isLoading: boolean;
	callback: ( inputValue: string ) => void;
};

const editModeFieldSx = {
	...contentPanelListItemButtonSx,
	display: 'block',
	py: 0.25,
	width: '100%',
};

const editModeTextFieldSx = {
	'& .MuiInputBase-input': {
		...contentPanelListRowTitleSx,
		height: '1.25rem',
		lineHeight: 1.25,
		padding: 0,
	},
	'& .MuiInput-root': {
		minHeight: 0,
		padding: 0,
	},
};

export default function EditModeTemplate( { postTitle, isLoading, callback }: Props ) {
	const { resetEditMode } = usePostListContext();
	const [ title, setTitle ] = useState( postTitle );
	const [ touched, setTouched ] = useState( false );
	const [ inputError, setInputError ] = useState< string | null >( null );
	const closeButton = useRef< HTMLButtonElement >();

	const onBlur = ( e: FocusEvent ) => {
		if ( closeButton.current === e.relatedTarget ) {
			return;
		}

		if ( ! touched ) {
			resetEditMode();
			return;
		}

		runCallback();
	};

	const onFormSubmit = ( e: FormEvent< HTMLFormElement > ) => {
		e.preventDefault();
		runCallback();
	};

	const validateInput = ( input: string ) => {
		return input.trim() !== '';
	};

	const runCallback = () => {
		if ( ! validateInput( title ) ) {
			return;
		}

		callback( title );
	};

	const onChange = ( e: React.ChangeEvent< { value: string } > ) => {
		if ( ! touched ) {
			setTouched( true );
		}
		const value = e.target.value;
		if ( ! validateInput( value ) ) {
			setInputError( __( 'Name is required', 'elementor' ) );
		} else {
			setInputError( null );
		}

		setTitle( value );
	};

	return (
		<>
			<ListItem
				disablePadding
				sx={ contentPanelListRowPaddingSx }
				secondaryAction={ <CloseButton isLoading={ isLoading } closeButton={ closeButton } /> }
			>
				<Box component="form" onSubmit={ onFormSubmit } sx={ editModeFieldSx }>
					<TextField
						autoFocus // eslint-disable-line jsx-a11y/no-autofocus
						color="secondary"
						disabled={ isLoading }
						error={ !! inputError }
						fullWidth
						inputProps={ {
							'aria-invalid': !! inputError,
							'aria-label': __( 'Name', 'elementor' ),
						} }
						onBlur={ onBlur }
						onChange={ onChange }
						size="tiny"
						sx={ editModeTextFieldSx }
						value={ title }
						variant="standard"
						InputProps={ {
							disableUnderline: true,
						} }
					/>
				</Box>
			</ListItem>
			{ inputError && (
				<ListItem disablePadding sx={ contentPanelListRowPaddingSx }>
					<ListItemText sx={ { color: 'error.main', ...contentPanelListRowTitleSx } }>
						{ inputError }
					</ListItemText>
				</ListItem>
			) }
		</>
	);
}

type CloseButtonProps = {
	isLoading: boolean;
	closeButton: MutableRefObject< HTMLButtonElement | undefined >;
};

function CloseButton( { isLoading, closeButton }: CloseButtonProps ) {
	const { resetEditMode } = usePostListContext();

	return (
		<IconButton size="tiny" color="secondary" onClick={ resetEditMode } ref={ closeButton } disabled={ isLoading }>
			{ isLoading ? <CircularProgress size="1rem" /> : <XIcon fontSize="tiny" /> }
		</IconButton>
	);
}
