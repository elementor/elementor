import { useState, useRef } from 'react';

import Layout from '../../templates/layout';
import DragDrop from './drag-drop/drag-drop';
import Message from '../../ui/message/message';
import Box from '../../ui/box/box';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Button from 'elementor-app/ui/molecules/button';

import './import.scss';

export default function Import() {
	const onDrop = ( event ) => {
			event.preventDefault();
			console.log( 'onDrop' );
		},
		onDragOver = ( event ) => {
			event.preventDefault();
			console.log( 'onDragOver' );
		},
		onFileSelect = ( event ) => {
			console.log( event.target.files[0] );
		},
		fileInput = useRef(),
		sendImportData = () => {
			const options = {
				data: {
					elementor_export_kit: {
						title: 'My Awesome Kit',
						include: [ 'templates', 'settings', 'content' ],
						custom_post_types: [ 'product', 'acf' ],
					},
				},
				success: () => {
					//setApiStatus( 'success' );
				},
				error: () => {
					//setApiStatus( 'error' );
				},
				complete: () => {},
			};

			setApiStatus( 'waiting' );

			elementorCommon.ajax.addRequest( 'elementor_export_kit', options );
		};

	return (
		<Layout type="import">
			<section className="e-app-import">
				<div onDrop={ onDrop } onDragOver={ onDragOver }>
					<Message className="e-app-import__select-file">
					<Heading variant="lg">
						{ __( 'Import a Kit to Your Site', 'elementor' ) }
					</Heading>

					<Text variant="md">
						{ __( 'Drag & Drop your zip template file', 'elementor' ) }
					</Text>

					<Text variant="sm">
						{ __( 'Or', 'elementor' ) }
					</Text>

					<input ref={ fileInput } onChange={ onFileSelect } type="file" className="elementor-hide" />

					<Button variant="contained" color="primary" size="sm" onClick={ () => { fileInput.current.click(); } } text={ __( 'Select File', 'elementor' ) } />
					</Message>
				</div>

				<Box type="notice">
					{ __( 'Important: It is strongly recommended that you backup your database before Importing a Kit.', 'elementor' ) }
				</Box>
			</section>
		</Layout>
	);
}

