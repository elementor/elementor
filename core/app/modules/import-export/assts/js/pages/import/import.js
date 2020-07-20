import { useState, useRef, useEffect } from 'react';

import Layout from '../../templates/layout';
import Message from '../../ui/message/message';
import Box from '../../ui/box/box';
import DragDrop from '../../ui/drag-drop/drag-drop';
import Icon from 'elementor-app/ui/atoms/icon';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Button from 'elementor-app/ui/molecules/button';

import './import.scss';

export default function Import() {
	const [ file, setFile ] = useState(),
		dragDropEvents = {
			onDrop: ( event ) => {
				setFile( event.dataTransfer.files[ 0 ] );
			},
		},
		onFileSelect = ( event ) => {
			setFile( event.target.files[ 0 ] );
		},
		fileInput = useRef();

	useEffect( () => {
		if ( file ) {
			const formData = new FormData();

			formData.append( file.name, file );

			console.log( 'file', file );

			const options = {
				data: formData,
				success: () => {
				},
				error: () => {
				},
				complete: () => {},
			};

			elementorCommon.ajax.addRequest( 'elementor_export_kit', options );
		}
	}, [ file ] );

	return (
		<Layout type="import">
			<section className="e-app-import">
				<DragDrop { ...dragDropEvents }>
					<Message>
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
				</DragDrop>

				<Box variant="notice" className="kit-content-list__notice">
					<Text variant="xs">
						{ __( 'Important: It is strongly recommended that you backup your database before Importing a Kit.', 'elementor' ) }
					</Text>
				</Box>
			</section>
		</Layout>
	);
}

