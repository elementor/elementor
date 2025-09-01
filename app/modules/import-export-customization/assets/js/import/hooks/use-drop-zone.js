import { useState, useRef, useId } from 'react';
import { __ } from '@wordpress/i18n';
import { isValidFileType } from '../utils/file-validation';

const useDropZone = ( { onFileSelect, onError, filetypes, isLoading, onButtonClick, onFileChoose } ) => {
	const [ isDragOver, setIsDragOver ] = useState( false );
	const [ , setDragCounter ] = useState( 0 );
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

		setDragCounter( ( prev ) => {
			const newCounter = prev - 1;
			if ( newCounter <= 0 ) {
				setIsDragOver( false );
			}
			return newCounter;
		} );
	};

	const handleDragOver = ( e ) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = ( e ) => {
		e.preventDefault();
		e.stopPropagation();

		setIsDragOver( false );
		setDragCounter( 0 );

		if ( isLoading ) {
			return;
		}

		if ( ! e.dataTransfer.files || 0 === e.dataTransfer.files.length ) {
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

	const handleFileInputChange = ( e ) => {
		if ( ! e.target.files || 0 === e.target.files.length ) {
			return;
		}

		const file = e.target.files[ 0 ];
		if ( ! file ) {
			return;
		}

		if ( ! isValidFileType( file.type, file.name, filetypes ) ) {
			onError( {
				id: 'file_not_allowed',
				message: __( 'This file type is not allowed', 'elementor' ),
			} );
			return;
		}

		onFileSelect( file, e, 'browse' );

		if ( onFileChoose ) {
			onFileChoose( file );
		}
	};

	const handleUploadClick = ( e ) => {
		if ( onButtonClick ) {
			onButtonClick( e );
		}

		if ( fileInputRef.current ) {
			fileInputRef.current.click();
		}
	};

	return {
		isDragOver,
		fileInputRef,
		fileInputId,
		handleDragEnter,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		handleFileInputChange,
		handleUploadClick,
	};
};

export default useDropZone;
