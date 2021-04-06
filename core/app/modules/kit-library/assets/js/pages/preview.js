import Layout from '../components/layout';
import useKit from '../hooks/use-kit';
import { PreviewIframe } from '../components/preview-iframe';
import PreviewResponsiveControls from '../components/preview-responsive-controls';
import { useNavigate } from '@reach/router';
import ItemHeader from '../components/item-header';

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
	const headersButtons = useHeaderButtons( props.id );
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
			<ItemHeader
				model={ data }
				buttons={ headersButtons }
				centerSlot={ <PreviewResponsiveControls active={ activeDevice } onChange={ setActiveDevice }/> }
			/>
		}>
			{ data.previewUrl && <PreviewIframe previewUrl={ data.previewUrl } style={ iframeStyle }/> }
		</Layout>
	);
}

Preview.propTypes = {
	id: PropTypes.string,
};

function useHeaderButtons( id ) {
	const navigate = useNavigate();

	return useMemo( () => [
		{
			id: 'overview',
			text: __( 'Overview', 'elementor' ),
			hideText: false,
			variant: 'outlined',
			color: 'primary',
			size: 'sm',
			onClick: () => navigate( `/kit-library/${ id }` ),
		},
	], [ id ] );
}

