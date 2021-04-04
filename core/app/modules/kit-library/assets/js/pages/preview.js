import Header from '../components/layout/header';
import Layout from '../components/layout';
import useKit from '../hooks/use-kit';
import HeaderBackButton from '../components/layout/header-back-button';
import { PreviewIframe } from '../components/preview-iframe';
import useHeadersButtons from '../hooks/use-headers-buttons';
import PreviewResponsiveControls from '../components/preview-responsive-controls';
import HeaderButtons from 'elementor-app/layout/header-buttons';

const { useState, useMemo } = React;

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
			marginTop: '30px',
			marginBottom: '30px',
			width: '768px',
			height: '1024px',
		},
	},
	{
		value: 'mobile',
		label: __( 'Mobile', 'elementor' ),
		style: {
			marginTop: '30px',
			marginBottom: '30px',
			width: '375px',
			height: '667px',
		},
	},
];

export default function Preview( props ) {
	const { data, isError, isLoading } = useKit( props.id );
	const headersButtons = useHeadersButtons( [ 'info', 'insert-kit' ], props.id );
	const [ activeDevice, setActiveDevice ] = useState( 'desktop' );
	const iframeStyle = useMemo(
		() => breakpoints.find( ( { value } ) => value === activeDevice ).style,
		[ activeDevice ]
	);

	if ( isError ) {
		return 'Error!';
	}

	if ( isLoading ) {
		return 'Loading...';
	}

	return (
		<Layout header={
			<Header
				startSlot={ <div style={ { flex: 1, height: '100%' } }><HeaderBackButton/></div> }
				centerSlot={ <PreviewResponsiveControls active={ activeDevice } onChange={ setActiveDevice }/> }
				endSlot={ <div style={ { flex: 1 } }><HeaderButtons buttons={ headersButtons }/></div> }
			/>
		}>
			<PreviewIframe previewUrl={ data.previewUrl } style={ iframeStyle }/>
		</Layout>
	);
}

Preview.propTypes = {
	id: PropTypes.string,
};
