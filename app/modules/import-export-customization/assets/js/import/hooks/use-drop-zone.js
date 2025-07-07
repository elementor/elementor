import { useState, useRef, useId } from 'react';
import { __ } from '@wordpress/i18n';
import { isValidFileType } from '../utils/file-validation';

const useDropZone = ( { onFileSelect, onError, filetypes, isLoading } ) => {
	const [ isDragOver, setIsDragOver ] = useState( false );
	const [ dragCounter, setDragCounter ] = useState( 0 );
	const fileInputRef = useRef( null );
	const fileInputId = useId();

	const handleDragEnter = ( e ) => {
		e.preventDefault();
		e.stopPropagation();

		setDragCounter( ( prev ) => prev + 1 );

		if ( e.dataTransfer.items && e.dataTransfer.items.length > 0 ) {
			setIsDragOver( true );
		}
	};

	const handleDragLeave = ( e ) => {
		e.preventDefault();
		e.stopPropagation();

		setDragCounter( ( prev ) => prev - 1 );

		if ( dragCounter <= 1 ) {
			setIsDragOver( false );
		}
	};

	const handleDrop = ( e ) => {
		e.preventDefault();
		e.stopPropagation();

		setIsDragOver( false );
		setDragCounter( 0 );

		if ( isLoading ) {
			return;
		}

		const file = e.dataTransfer.files[ 0 ];

		if ( file && isValidFileType( file.type, file.name, filetypes ) ) {
			onFileSelect( file, e, 'drop' );
		} else {
			onError( {
				id: 'file_not_allowed',
				message: __( 'This file type is not allowed', 'elementor' ),
			} );
		}
	};

	return {
		isDragOver,
		fileInputRef,
		fileInputId,
		handleDragEnter,
		handleDragLeave,
		handleDrop,
	};
};

export default useDropZone;
