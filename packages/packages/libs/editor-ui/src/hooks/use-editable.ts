import { useEffect, useRef, useState } from 'react';

type UseEditableParams = {
	value: string;
	onSubmit: ( value: string ) => unknown;
	validation?: ( value: string ) => string | null;
	onClick?: ( event: React.MouseEvent< HTMLDivElement > ) => void;
	onError?: ( error: string | null ) => void;
};

export const useEditable = ( { value, onSubmit, validation, onClick, onError }: UseEditableParams ) => {
	const [ isEditing, setIsEditing ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );

	const ref = useSelection( isEditing );

	const isDirty = ( newValue: string ) => newValue !== value;

	const openEditMode = () => {
		setIsEditing( true );
	};

	const closeEditMode = () => {
		ref.current?.blur();

		setError( null );
		onError?.( null );
		setIsEditing( false );
	};

	const submit = ( newValue: string ) => {
		if ( ! isDirty( newValue ) ) {
			return;
		}

		if ( ! error ) {
			try {
				onSubmit( newValue );
			} finally {
				closeEditMode();
			}
		}
	};

	const onChange = ( event: React.ChangeEvent< HTMLSpanElement > ) => {
		const { innerText: newValue } = event.target;

		if ( validation ) {
			const updatedError = isDirty( newValue ) ? validation( newValue ) : null;

			setError( updatedError );
			onError?.( updatedError );
		}
	};

	const handleKeyDown = ( event: React.KeyboardEvent ) => {
		event.stopPropagation();

		if ( [ 'Escape' ].includes( event.key ) ) {
			return closeEditMode();
		}

		if ( [ 'Enter' ].includes( event.key ) ) {
			event.preventDefault();
			return submit( ( event.target as HTMLElement ).innerText );
		}
	};

	const handleClick = ( event: React.MouseEvent< HTMLDivElement > ) => {
		if ( isEditing ) {
			event.stopPropagation();
		}

		onClick?.( event );
	};

	const listeners = {
		onClick: handleClick,
		onKeyDown: handleKeyDown,
		onInput: onChange,
		onBlur: closeEditMode,
	} as const;

	const attributes = {
		value,
		role: 'textbox',
		contentEditable: isEditing,
		...( isEditing && {
			suppressContentEditableWarning: true,
		} ),
	} as const;

	return {
		ref,
		isEditing,
		openEditMode,
		closeEditMode,
		value,
		error,
		getProps: () => ( { ...listeners, ...attributes } ),
	} as const;
};

const useSelection = ( isEditing: boolean ) => {
	const ref = useRef< HTMLElement | null >( null );

	useEffect( () => {
		if ( isEditing ) {
			selectAll( ref.current );
		}
	}, [ isEditing ] );

	return ref;
};

const selectAll = ( el: HTMLElement | null ) => {
	const selection = getSelection();

	if ( ! selection || ! el ) {
		return;
	}

	const range = document.createRange();
	range.selectNodeContents( el );

	selection.removeAllRanges();
	selection.addRange( range );
};
