import Header from '../components/layout/header';
import Layout from '../components/layout';
import useKit from '../hooks/use-kit';
import HeaderBackButton from '../components/layout/header-back-button';
import { PreviewIframe } from '../components/preview-iframe';
import useHeadersButtons from '../hooks/use-headers-buttons';

export default function Preview( props ) {
	const { data, isError, isLoading } = useKit( props.id );
	const headerButtons = useHeadersButtons( [ 'info', 'insert-kit' ], props.id );

	if ( isError ) {
		return 'Error!';
	}

	if ( isLoading ) {
		return 'Loading...';
	}

	return (
		<Layout header={
			<Header startSlot={ <HeaderBackButton/> } buttons={ headerButtons }/>
		}>
			<PreviewIframe previewUrl={ data.previewUrl }/>
		</Layout>
	);
}

Preview.propTypes = {
	id: PropTypes.string,
};
