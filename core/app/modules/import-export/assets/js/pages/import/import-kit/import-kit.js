import { useState, useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import ImportFailedDialog from '../../../shared/import-failed-dialog/import-failed-dialog';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import Notice from 'elementor-app/ui/molecules/notice';
import DropZone from 'elementor-app/organisms/drop-zone';

import useAjax from 'elementor-app/hooks/use-ajax';

import './import-kit.scss';

export default function ImportKit() {
	const { ajaxState, setAjax } = useAjax(),
		[ isImportFailed, setIsImportFailed ] = useState( false ),
		[ isLoading, setIsLoading ] = useState( false ),
		context = useContext( Context ),
		navigate = useNavigate(),
		resetImportProcess = () => {
			context.dispatch( { type: 'SET_FILE', payload: null } );
			setIsImportFailed( false );
		},
		getLearnMoreLink = () => (
			<InlineLink url="https://go.elementor.com/app-what-are-kits" italic>
				{ __( 'Learn More', 'elementor' ) }
			</InlineLink>
		);

	useEffect( () => {
		if ( context.data.file ) {
			setAjax( {
				data: {
					e_import_file: context.data.file,
					action: 'elementor_import_kit',
					data: JSON.stringify( {
						include: [ 'templates', 'content', 'site-settings' ],
					} ),
				},
			} );
		}
	}, [ context.data.file ] );

	useEffect( () => {
		console.log( 'ajaxState.status', ajaxState );
		if ( 'success' === ajaxState.status ) {
			navigate( '/import/content' );
		}
	}, [ ajaxState.status ] );

	return (
		<Layout type="import">
			<section className="e-app-import">
				<PageHeader
					heading={ __( 'Import a Template Kit', 'elementor' ) }
					description={
						<>
							{ __( 'Upload a file with Elementor components - pages, site settings, headers, etc. - so you can access them later and quickly apply them to your site.', 'elementor' ) } { getLearnMoreLink() }
						</>
					}
				/>

				<Notice label={ __( 'Important', 'elementor' ) } color="warning" className="e-app-import__notice">
					{ __( 'We recommend that you backup your site before importing a kit file.', 'elementor' ) }
				</Notice>

				<DropZone
					className="e-app-import__drop-zone"
					heading={ __( 'Upload Files to Your Library', 'elementor' ) }
					text={ __( 'Drag & drop the .zip file with your Kit', 'elementor' ) }
					secondaryText={ __( 'Or', 'elementor' ) }
					filetypes={ [ 'zip' ] }
					onFileSelect={ ( file ) => {
						setIsLoading( true );
						context.dispatch( { type: 'SET_FILE', payload: file } );
					} }
					onError={ () => setIsImportFailed( true ) }
					isLoading={ isLoading }
				/>

				{ isImportFailed && <ImportFailedDialog onRetry={ resetImportProcess } /> }
			</section>
		</Layout>
	);
}

