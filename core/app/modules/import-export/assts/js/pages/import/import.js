import { useState, useRef, useEffect } from 'react';

import Layout from '../../templates/layout';
import Message from '../../ui/message/message';
import Box from '../../ui/box/box';
import Icon from 'elementor-app/ui/atoms/icon';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Button from 'elementor-app/ui/molecules/button';

import './import.scss';

export default function Import() {
	const [ isDragOver, setIsDragOver ] = useState( false ),
		[ file, setFile ] = useState(),
		onDragDropActions = ( event ) => {
			event.preventDefault();
			event.stopPropagation();
		},
		dragDropEvents = {
			onDrop: ( event ) => {
				onDragDropActions( event );

				setIsDragOver( false );

				setFile( event.dataTransfer.files[ 0 ] );
			},
			onDragOver: ( event ) => {
				onDragDropActions( event );

				setIsDragOver( true );
			},
			onDragLeave: ( event ) => {
				onDragDropActions( event );

				setIsDragOver( false );
			},
		},
		onFileSelect = ( event ) => {
			setFile( event.target.files[ 0 ] );
		},
		fileInput = useRef(),
		getSelectFileClasses = () => {
			const className = 'e-app-import__select-file';

			return className + ( isDragOver ? ` ${ className }--drop-over` : '' );
		};

	useEffect( () => {
		if ( file ) {
			const formData = new FormData();

			formData.append( file.name, file );

			console.log( 'formData', formData );

			const options = {
				data: formData,
				success: () => {
					//setApiStatus( 'success' );
				},
				error: () => {
					//setApiStatus( 'error' );
				},
				complete: () => {},
			};

			//setApiStatus( 'waiting' );

			elementorCommon.ajax.addRequest( 'elementor_export_kit', options );
		}
	}, [ file ] );

	return (
		<Layout type="import">
			<section className="e-app-import">
				<div { ...dragDropEvents }>
					<Message className={ getSelectFileClasses() }>
						<Icon className="e-app-import__icon eicon-library-upload" />

						<Heading variant="display-3">
							{ __( 'Import a Kit to Your Site', 'elementor' ) }
						</Heading>

						<Text variant="xl">
							{ __( 'Drag & Drop your zip template file', 'elementor' ) }
						</Text>

						<Text variant="lg">
							{ __( 'Or', 'elementor' ) }
						</Text>

						<input ref={ fileInput } onChange={ onFileSelect } type="file" className="e-app-import__file-input" />

						<Button onClick={ () => fileInput.current.click() } text={ __( 'Select File', 'elementor' ) } variant="contained" color="primary" size="sm" />
					</Message>
				</div>

				<Box variant="notice" className="kit-content-list__notice">
					<Text variant="xs">
						{ __( 'Important: It is strongly recommended that you backup your database before Importing a Kit.', 'elementor' ) }
					</Text>
				</Box>
			</section>
		</Layout>
	);
}

