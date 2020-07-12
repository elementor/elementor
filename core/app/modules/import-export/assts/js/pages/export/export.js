import { useState } from 'react';
import { Redirect } from '@reach/router';

import Layout from '../../templates/layout';
import Box from '../../ui/box/box';
import ExportContentList from './export-content-list/export-content-list';
import Footer from '../../shared/footer/footer';
import Heading from 'elementor-app/ui/atoms/heading';
import Button from 'elementor-app/ui/molecules/button';

import '../import-export.scss';
import './export.scss';

export default function Export() {
	const [ apiStatus, setApiStatus ] = useState(),
		sendExportData = () => {
			const options = {
				data: {
					elementor_export_kit: {
						title: 'My Awesome Kit',
						include: [ 'templates', 'settings', 'content' ],
						custom_post_types: [ 'product', 'acf' ],
					},
				},
				success: () => {
					setApiStatus( 'success' );
				},
				error: () => {
					setApiStatus( 'error' );
				},
				complete: () => {},
			};

			setApiStatus( 'waiting' );

			elementorCommon.ajax.addRequest( 'elementor_export_kit', options );
		};

	return (
		<Layout type="export">
			<section className="e-app-export">
				<div className="e-app-export__kit-name">
					<Heading variant="h2" tag="h1">
						{ __( 'Kit Name', 'elementor' ) }
					</Heading>
					<Box>
						<input type="text" defaultValue="Elementor cloud site" />
					</Box>
				</div>

				<div className="e-app-export__kit-content">
					<Heading variant="h2">
						{ __( 'Choose What To Include In The Kit', 'elementor' ) }
					</Heading>
					<ExportContentList />
				</div>

				{ 'success' === apiStatus ? <Redirect to="/export/success" noThrow /> : null }

				<Footer separator justify="end">
					<Button onClick={ sendExportData } size="lg" color="primary" text={ __( 'Next', 'elementor' ) } />
				</Footer>
			</section>
		</Layout>
	);
}

