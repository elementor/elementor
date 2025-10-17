import ElementorLoading from 'elementor-app/molecules/elementor-loading';
import ItemHeader from '../../components/item-header';
import Layout from '../../components/layout';
import PageLoader from '../../components/page-loader';
import PreviewResponsiveControls from './preview-responsive-controls';
import useKit from '../../hooks/use-kit';
import usePageTitle from 'elementor-app/hooks/use-page-title';
import { PreviewIframe } from './preview-iframe';
import { useLocation, useNavigate } from '@reach/router';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useTracking } from '../../context/tracking-context';

import './preview.scss';

export const breakpoints = [
	{
		value: 'desktop',
		label: __( 'Desktop', 'elementor' ),
		style: {
			width: '100%',
			height: '100%',
		},
	},
	{
		value: 'tablet',
		label: __( 'Tablet', 'elementor' ),
		style: {
			marginBlockStart: '30px',
			marginBlockEnd: '30px',
			width: '768px',
			height: '1024px',
		},
	},
	{
		value: 'mobile',
		label: __( 'Mobile', 'elementor' ),
		style: {
			marginBlockStart: '30px',
			marginBlockEnd: '30px',
			width: '375px',
			height: '667px',
		},
	},
];

function useHeaderButtons( id, kitName ) {
	const navigate = useNavigate();
	const tracking = useTracking();

	return useMemo( () => [
		{
			id: 'overview',
			text: __( 'Overview', 'elementor' ),
			hideText: false,
			variant: 'outlined',
			color: 'secondary',
			size: 'sm',
			onClick: () => {
				tracking.trackKitdemoOverviewClicked( id, kitName, () => navigate( `/kit-library/overview/${ id }` ) );
			},
			includeHeaderBtnClass: false,
		},
	], [ id, kitName, tracking, navigate ] );
}

/**
 * Get preview url.
 *
 * @param {*} data
 * @return {null|string} Preview URL
 */
function usePreviewUrl( data ) {
	const location = useLocation();

	return useMemo( () => {
		if ( ! data ) {
			return null;
		}

		const documentId = new URLSearchParams( location.pathname.split( '?' )?.[ 1 ] ).get( 'document_id' ),
			utm = '?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=preview',
			previewUrl = data.previewUrl ? data.previewUrl + utm : data.previewUrl;

		if ( ! documentId ) {
			return previewUrl;
		}

		const documentPreviewUrl = data.documents.find( ( item ) => item.id === parseInt( documentId ) )?.previewUrl || previewUrl;
		return documentPreviewUrl ? documentPreviewUrl + utm : documentPreviewUrl;
	}, [ location, data ] );
}

export default function Preview( props ) {
	const { data, isError, isLoading } = useKit( props.id );
	const [ isIframeLoading, setIsIframeLoading ] = useState( true );
	const headersButtons = useHeaderButtons( props.id, data && data.title );
	const previewUrl = usePreviewUrl( data );
	const [ activeDevice, setActiveDevice ] = useState( 'desktop' );
	const tracking = useTracking();
	const loadStartTime = useRef( Date.now() );
	const hasTrackedOpen = useRef( false );

	const iframeStyle = useMemo(
		() => breakpoints.find( ( { value } ) => value === activeDevice ).style,
		[ activeDevice ],
	);

	useEffect( () => {
		if ( ! isIframeLoading && data && ! hasTrackedOpen.current ) {
			const loadTime = Date.now() - loadStartTime.current;
			tracking.trackKitdemoOpened( props.id, data.title, loadTime );
			hasTrackedOpen.current = true;
		}
	}, [ isIframeLoading, data, props.id, tracking ] );

	const onChange = ( device ) => {
		setActiveDevice( device );
	};

	usePageTitle( {
		title: data
			? `${ __( 'Kit Library', 'elementor' ) } | ${ data.title }`
			: __( 'Loading...', 'elementor' ),
	} );

	if ( isError ) {
		// Will be caught by the App error boundary.
		throw new Error();
	}

	if ( isLoading ) {
		return <ElementorLoading />;
	}

	return (
		<Layout header={
			<ItemHeader
				model={ data }
				buttons={ headersButtons }
				centerColumn={ <PreviewResponsiveControls active={ activeDevice } onChange={ ( device ) => onChange( device ) } kitName={ data.title } /> }
				pageId="demo"
			/>
		}>
			{ isIframeLoading && <PageLoader className="e-kit-library__preview-loader" /> }
			{
				previewUrl &&
					<PreviewIframe
						previewUrl={ previewUrl }
						style={ iframeStyle }
						onLoaded={ () => setIsIframeLoading( false ) }
					/>
			}
		</Layout>
	);
}

Preview.propTypes = {
	id: PropTypes.string,
};

