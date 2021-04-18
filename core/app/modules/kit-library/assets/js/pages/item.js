import Layout from '../components/layout';
import useKit from '../hooks/use-kit';
import Content from '../../../../../assets/js/layout/content';
import ItemSidebar from '../components/item-sidebar';
import ItemContentOverview from '../components/item-content-overview';
import useKitDocumentByType from '../hooks/use-kit-document-by-type';
import ItemHeader from '../components/item-header';
import { useNavigate } from '@reach/router';

const { useMemo } = React;

function useHeaderButtons( id ) {
	const navigate = useNavigate();

	return useMemo( () => [
		{
			id: 'view-demo',
			text: __( 'View Demo', 'elementor' ),
			hideText: false,
			variant: 'outlined',
			color: 'primary',
			size: 'sm',
			onClick: () => navigate( `/kit-library/preview/${ id }` ),
		},
	], [ id ] );
}

export default function Item( props ) {
	const { data, isError, isLoading } = useKit( props.id );
	const { data: documentsByType } = useKitDocumentByType( data );
	const headerButtons = useHeaderButtons( props.id );

	if ( isError ) {
		return __( 'Error!', 'elementor' );
	}

	if ( isLoading ) {
		return __( 'Loading...', 'elementor' );
	}

	return (
		<Layout
			header={ <ItemHeader model={ data } buttons={ headerButtons }/> }
			sidebar={ <ItemSidebar model={ data } groupedKitContent={ documentsByType }/> }
		>
			{
				documentsByType.length > 0 &&
				<Content>
					<ItemContentOverview documentsByType={ documentsByType }/>
				</Content>
			}
		</Layout>
	);
}

Item.propTypes = {
	id: PropTypes.string,
};
