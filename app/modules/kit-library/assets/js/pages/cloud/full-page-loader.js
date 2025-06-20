import PropTypes from 'prop-types';
import Content from '../../../../../../assets/js/layout/content';
import IndexHeader from '../index/index-header';
import IndexSidebar from '../index/index-sidebar';
import Layout from '../../components/layout';
import PageLoader from '../../components/page-loader';

export default function FullPageLoader( {
	menuItems,
	forceRefetch,
	isFetching,
} ) {
	return (
		<Layout
			sidebar={
				<IndexSidebar menuItems={ menuItems } />
			}
			header={
				<IndexHeader
					refetch={ () => {
						forceRefetch();
					} }
					isFetching={ isFetching }
				/>
			}
		>
			<div className="e-kit-library__index-layout-container">
				<Content className="e-kit-library__index-layout-main">
					<PageLoader />
				</Content>
			</div>
		</Layout>
	);
}

FullPageLoader.propTypes = {
	menuItems: PropTypes.array.isRequired,
	forceRefetch: PropTypes.func.isRequired,
	isFetching: PropTypes.bool.isRequired,
};
