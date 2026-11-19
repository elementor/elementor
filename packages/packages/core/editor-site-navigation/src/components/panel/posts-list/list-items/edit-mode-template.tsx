import * as React from 'react';
import { type FocusEvent, type FormEvent, type MutableRefObject, useRef, useState } from 'react';
import { XIcon } from '@elementor/icons';
import { Box, CircularProgress, IconButton, ListItem, TextField } from '@elementor/ui';
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

const editFieldBorderWidth = 2;

const editFieldContainerSx = ( hasError: boolean ) => ( {
	border: `${ editFieldBorderWidth }px solid`,
	borderColor: hasError ? 'error.main' : 'secondary.main',
	borderRadius: 0.5,
	display: 'flex',
	flex: 1,
	minWidth: 0,
	px: 1,
	width: '100%',
} );

const editModeTextFieldSx = {
	'& .MuiInputBase-input': {
		...contentPanelListRowTitleSx,
		padding: 0,
	},
	'& .MuiInput-root': {
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
		<ListItem
			disablePadding
			sx={ contentPanelListRowPaddingSx }
			secondaryAction={ <CloseButton isLoading={ isLoading } closeButton={ closeButton } /> }
		>
			<Box
				component="form"
				onSubmit={ onFormSubmit }
				sx={ {
					...contentPanelListItemButtonSx,
					display: 'flex',
					width: '100%',
				} }
			>
				<Box sx={ editFieldContainerSx( !! inputError ) }>
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
			</Box>
		</ListItem>
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