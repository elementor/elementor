import Header from '../../components/layout/header';
import { ModalProvider, Heading, Text, Button } from '@elementor/app-ui';
import { useMemo, useState, useRef } from 'react';
import { useNavigate } from '@reach/router';
import PopoverDialog from 'elementor-app/ui/popover-dialog/popover-dialog';
import { useReturnTo } from '../../context/return-to-context';

import './index-header.scss';

export default function IndexHeader( props ) {
	const navigate = useNavigate();
	const [ isInfoModalOpen, setIsInfoModalOpen ] = useState( false );
	const importRef = useRef();
	const returnTo = useReturnTo();
	const shouldShowImportButton = elementorAppConfig.user.is_administrator || ( elementorAppConfig.user.restrictions?.includes( 'json-upload' ) ?? false );
	const buttons = useMemo( () => [
		{
			id: 'info',
			text: __( 'Info', 'elementor' ),
			hideText: true,
			icon: 'eicon-info-circle-o',
			onClick: () => {
				setIsInfoModalOpen( true );
			},
		},
		{
			id: 'refetch',
			text: __( 'Refetch', 'elementor' ),
			hideText: true,
			icon: `eicon-sync ${ props.isFetching ? 'eicon-animation-spin' : '' }`,
			onClick: () => {
				props.refetch();
			},
		},
		shouldShowImportButton && {
			id: 'import',
			text: __( 'Import', 'elementor' ),
			hideText: true,
			icon: 'eicon-upload-circle-o',
			elRef: importRef,
			onClick: () => {
				let importUrl = '/import?referrer=kit-library';
				if ( returnTo ) {
					importUrl += `&return_to=${ encodeURIComponent( returnTo ) }`;
				}
				navigate( importUrl );
			},
		},
	], [ props.isFetching, props.refetch, shouldShowImportButton, navigate, returnTo ] );

	return (
		<>
			<Header buttons={ buttons } />
			<PopoverDialog
				targetRef={ importRef }
				wrapperClass="e-kit-library__tooltip"
			>
				{ __( 'Import Website Template', 'elementor' ) }
			</PopoverDialog>
			<ModalProvider title={ __( 'Welcome to the Library', 'elementor' ) }
				show={ isInfoModalOpen }
				setShow={ setIsInfoModalOpen }
			>
				<div className="e-kit-library-header-info-modal-container">
					<Heading tag="h3" variant="h3">{ __( 'What\'s a Website Template?', 'elementor' ) }</Heading>
					<Text>{ __( 'A Website Template is full, ready-made design that you can apply to your site. It includes all the pages, parts, settings and content that you\'d expect in a fully functional website.', 'elementor' ) }</Text>
				</div>
				<div className="e-kit-library-header-info-modal-container">
					<Heading tag="h3" variant="h3">{ __( 'What\'s going on in the Website Templates Library?', 'elementor' ) }</Heading>
					<Text>
						{ __( 'Search & filter for website templates by category and tags, or browse through individual website templates to see what\'s inside.', 'elementor' ) }
						<br />
						{ __( 'Once you\'ve picked a winner, apply it to your site!', 'elementor' ) }
					</Text>
				</div>
				<div>
					<Heading tag="h3" variant="h3">{ __( 'Happy browsing!', 'elementor' ) }</Heading>
					<Text>
						<Button
							url="https://go.elementor.com/app-kit-library-how-to-use-kits/"
							target="_blank"
							rel="noreferrer"
							text={ __( 'Learn more', 'elementor' ) }
							color="link"
						/>{ ' ' }
						{ __( 'about using templates', 'elementor' ) }
					</Text>
				</div>
			</ModalProvider>
		</>
	);
}

IndexHeader.propTypes = {
	refetch: PropTypes.func.isRequired,
	isFetching: PropTypes.bool,
};
