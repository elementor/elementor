import { useState, useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import ImportFailedDialog from '../../../shared/import-failed-dialog/import-failed-dialog';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import Notice from 'elementor-app/ui/molecules/notice';
import DropZone from 'elementor-app/organisms/drop-zone';
import Button from 'elementor-app/ui/molecules/button';

import useQueryParams from 'elementor-app/hooks/use-query-params';
import useKit from '../../../hooks/use-kit';

import './import-kit.scss';

export default function ImportKit() {
	const { kitState, kitActions, KIT_STATUS_MAP } = useKit(),
		[ isImportFailed, setIsImportFailed ] = useState( false ),
		[ isLoading, setIsLoading ] = useState( false ),
		context = useContext( Context ),
		navigate = useNavigate(),
		{ referrer } = useQueryParams().getAll(),
		resetImportProcess = () => {
			context.dispatch( { type: 'SET_FILE', payload: null } );
			setIsImportFailed( false );
			setIsLoading( false );
			kitActions.reset();
		},
		getLearnMoreLink = () => (
			<InlineLink url="https://go.elementor.com/app-what-are-kits" key="learn-more-link" italic>
				{ __( 'Learn More', 'elementor' ) }
			</InlineLink>
		);

	useEffect( () => {
		if ( context.data.file ) {
			kitActions.upload( { file: context.data.file } );
		}
	}, [ context.data.file ] );

	useEffect( () => {
		if ( KIT_STATUS_MAP.UPLOADED === kitState.status ) {
			context.dispatch( { type: 'SET_UPLOADED_DATA', payload: kitState.data } );
		} else if ( 'error' === kitState.status ) {
			setIsImportFailed( true );
		}
	}, [ kitState.status ] );

	useEffect( () => {
		if ( context.data.uploadedData && context.data.file ) {
			navigate( '/import/content' );
		}
	}, [ context.data.uploadedData ] );

	useEffect( () => {
		context.dispatch( { type: 'SET_INCLUDES', payload: [] } );
	}, [] );

	return (
		<Layout type="import">
			<section className="e-app-import">
				{
					'kit-library' === referrer &&
					<Button
						className="e-app-import__back-to-library"
						icon="eicon-chevron-left"
						text={ __( 'Back to Kit Library', 'elementor' ) }
						onClick={ () => navigate( '/kit-library' ) }
					/>
				}

				<PageHeader
					heading={ __( 'Import a Template Kit', 'elementor' ) }
					description={ [
						__( 'Upload a file with templates, site settings, content, etc., and apply them to your site automatically.', 'elementor' ),
						getLearnMoreLink(),
					] }
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

				{ isImportFailed &&
					<ImportFailedDialog
						onApprove={ () => window.open( 'https://elementor.com/help/import-kit?utm_source=import-export&utm_medium=wp-dash&utm_campaign=learn', '_blank' ) }
						onDismiss={ resetImportProcess }
					/>
				}
			</section>
		</Layout>
	);
}

