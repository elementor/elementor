import Layout from '../components/layout';
import Header from '../components/layout/header';
import HeaderBackButton from '../components/layout/header-back-button';
import useKit from '../hooks/use-kit';
import Content from '../../../../../assets/js/layout/content';
import useHeadersButtons from '../hooks/use-headers-buttons';
import ItemSidebar from '../components/item-sidebar';
import ItemContentOverview from '../components/item-content-overview';
import useGroupedKitContent from '../hooks/use-grouped-kit-content';

export default function Item( props ) {
	const { data, isError, isLoading } = useKit( props.id );
	const { data: groupedKitContent } = useGroupedKitContent( data );
	const headerButtons = useHeadersButtons( [ 'info', 'insert-kit', 'view-demo' ], props.id );

	if ( isError ) {
		return 'Error!';
	}

	if ( isLoading ) {
		return 'Loading...';
	}

	return (
		<Layout
			header={ <Header startSlot={ <HeaderBackButton/> } buttons={ headerButtons }/> }
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
