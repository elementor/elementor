import Layout from '../components/layout';
import useKit from '../hooks/use-kit';
import Content from '../../../../../assets/js/layout/content';
import ItemSidebar from '../components/item-sidebar';
import ItemContentOverview from '../components/item-content-overview';
import useGroupedKitContent from '../hooks/use-grouped-kit-content';
import ItemHeader from '../components/item-header';
import { useNavigate } from '@reach/router';

const { useMemo } = React;

export default function Item( props ) {
	const { data, isError, isLoading } = useKit( props.id );
	const { data: groupedKitContent } = useGroupedKitContent( data );
	const headerButtons = useHeaderButtons( props.id );

	if ( isError ) {
		return 'Error!';
	}

	if ( isLoading ) {
		return 'Loading...';
	}

	return (
		<Layout
			header={ <ItemHeader model={ data } buttons={ headerButtons }/> }
			sidebar={ <ItemSidebar model={ data } groupedKitContent={ groupedKitContent }/> }
		>
			{
				groupedKitContent.length > 0 &&
				<Content>
					<ItemContentOverview groupedKitContent={ groupedKitContent }/>
				</Content>
			}
		</Layout>
	);
}

Item.propTypes = {
	id: PropTypes.string,
};

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
