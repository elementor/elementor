import * as React from 'react';
import { type FocusEvent, type FormEvent, type MutableRefObject, useRef, useState } from 'react';
import { XIcon } from '@elementor/icons';
import { Box, CircularProgress, IconButton, ListItem, ListItemText } from '@elementor/ui';
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

const EDIT_ROW_FOCUS_BORDER_WIDTH_PX = 2;
const EDIT_ROW_MIN_HEIGHT_PX = 36;

const editModeListItemButtonSx = {
	...contentPanelListItemButtonSx,
	alignItems: 'center',
	backgroundColor: 'transparent',
	boxSizing: 'border-box',
	minHeight: EDIT_ROW_MIN_HEIGHT_PX,
	py: 0,
};

const editRowIndicatorSx = ( hasError: boolean ) => ( {
	alignItems: 'center',
	border: `${ EDIT_ROW_FOCUS_BORDER_WIDTH_PX }px solid`,
	borderColor: hasError ? 'error.main' : 'secondary.main',
	borderRadius: 0.5,
	boxSizing: 'border-box',
	display: 'flex',
	flex: 1,
	minHeight: 0,
	minWidth: 0,
	px: 1,
	py: 0,
} );

const editRowInputSx = {
	...contentPanelListRowTitleSx,
	backgroundColor: 'transparent',
	border: 0,
	color: 'text.secondary',
	flex: 1,
	fontFamily: 'inherit',
	lineHeight: 1.25,
	minWidth: 0,
	outline: 0,
	padding: 0,
	width: '100%',
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

	const onChange = ( e: React.ChangeEvent< HTMLInputElement > ) => {
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
				<Box
					component="form"
					onSubmit={ onFormSubmit }
					sx={ { ...editModeListItemButtonSx, display: 'flex', width: '100%' } }
				>
					<Box sx={ editRowIndicatorSx( !! inputError ) }>
						<Box
							autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							aria-invalid={ !! inputError }
							aria-label={ __( 'Name', 'elementor' ) }
							component="input"
							disabled={ isLoading }
							onBlur={ onBlur }
							onChange={ onChange }
							sx={ editRowInputSx }
							type="text"
							value={ title }
						/>
					</Box>
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
