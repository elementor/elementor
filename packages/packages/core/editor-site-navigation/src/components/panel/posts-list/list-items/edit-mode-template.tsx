import * as React from 'react';
import { type FocusEvent, type FormEvent, type MutableRefObject, useRef, useState } from 'react';
import { XIcon } from '@elementor/icons';
import { Box, CircularProgress, IconButton, ListItem, ListItemText, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { usePostListContext } from '../../../../contexts/post-list-context';

type Props = {
	postTitle: string;
	isLoading: boolean;
	callback: ( inputValue: string ) => void;
};

export default function EditModeTemplate( { postTitle, isLoading, callback }: Props ) {
	const [ title, setTitle ] = useState( postTitle );
	const [ touched, setTouched ] = useState( false );
	const [ inputError, setInputError ] = useState< string | null >( null );
	const closeButton = useRef< HTMLButtonElement >();

	const onBlur = ( e: FocusEvent ) => {
		if ( closeButton.current === e.relatedTarget ) {
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
			<ListItem secondaryAction={ <CloseButton isLoading={ isLoading } closeButton={ closeButton } /> }>
				<Box width="100%" component="form" onSubmit={ onFormSubmit }>
					<TextField
						autoFocus // eslint-disable-line jsx-a11y/no-autofocus
						fullWidth
						value={ title }
						onChange={ onChange }
						disabled={ isLoading }
						error={ !! inputError }
						onBlur={ onBlur }
						variant="outlined"
						color="secondary"
						size="small"
					/>
				</Box>
			</ListItem>
			{ inputError && (
				<ListItem>
					<ListItemText sx={ { color: 'error.main' } }>{ inputError }</ListItemText>
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
		<IconButton size="small" color="secondary" onClick={ resetEditMode } ref={ closeButton } disabled={ isLoading }>
			{ isLoading ? <CircularProgress /> : <XIcon fontSize="small" /> }
		</IconButton>
	);
}
