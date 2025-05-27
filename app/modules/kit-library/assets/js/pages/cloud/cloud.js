import Content from '../../../../../../assets/js/layout/content';
import ErrorScreen from '../../components/error-screen';
import IndexHeader from '../index/index-header';
import IndexSidebar from '../index/index-sidebar';
import KitListCloud from '../../components/kit-list-cloud';
import Layout from '../../components/layout';
import PageLoader from '../../components/page-loader';
import SearchInput from '../../components/search-input';
import useKits from '../../hooks/use-kits';
import useMenuItems from '../../hooks/use-menu-items';
import usePageTitle from 'elementor-app/hooks/use-page-title';
import { Grid } from '@elementor/app-ui';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';
import PropTypes from 'prop-types';

import '../index/index.scss';

/**
 * Cloud page component for managing cloud-based kits
 * 
 * @param {Object} props - Component props
 * @param {string} props.path - Current page path for routing and menu state
 * @param {Function} props.renderNoResultsComponent - Custom component renderer for no results state
 */
export default function Cloud( {
	path = '',
	renderNoResultsComponent = ( { defaultComponent } ) => defaultComponent,
} ) {
	usePageTitle( {
		title: __( 'Kit Library', 'elementor' ),
	} );

	const menuItems = useMenuItems( path );

	const {
		data,
		isSuccess,
		isLoading,
		isFetching,
		isError,
		queryParams,
		setQueryParams,
		clearQueryParams,
		forceRefetch,
		isFilterActive,
	} = useKits();

	const eventTracking = ( command, elementPosition, search = null, direction = null, sortType = null, action = null, eventType = 'click' ) => {
		appsEventTrackingDispatch(
			command,
			{
				page_source: 'cloud page',
				element_position: elementPosition,
				search_term: search,
				sort_direction: direction,
				sort_type: sortType,
				event_type: eventType,
				action,
			},
		);
	};

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
				<Grid container className="e-kit-library__index-layout-heading">
					<Grid item className="e-kit-library__index-layout-heading-search">
						<SearchInput
							// eslint-disable-next-line @wordpress/i18n-ellipsis
							placeholder={ __( 'Search all Cloud Kits...', 'elementor' ) }
							value={ queryParams.search }
							onChange={ ( value ) => {
								setQueryParams( ( prev ) => ( { ...prev, search: value } ) );
								eventTracking( 'kit-library/kit-free-search', 'top_area_search', value, null, null, null, 'search' );
							} }
						/>
					</Grid>
				</Grid>
				<Content className="e-kit-library__index-layout-main">
					<>
						{ isLoading && <PageLoader /> }
						{
							isError && <ErrorScreen
								title={ __( 'Something went wrong.', 'elementor' ) }
								description={ __( 'Nothing to worry about, use 🔄 on the top corner to try again. If the problem continues, head over to the Help Center.', 'elementor' ) }
								button={ {
									text: __( 'Learn More', 'elementor' ),
									url: 'https://go.elementor.com/app-kit-library-error/',
									target: '_blank',
								} }
							/>
						}
						{ isSuccess && 0 < data.length && <KitListCloud data={ data } source={ path } /> }
						{
							isSuccess && 0 === data.length && renderNoResultsComponent( {
								defaultComponent: <ErrorScreen
									title={ __( 'No results matched your search.', 'elementor' ) }
									description={ __( 'Try different keywords or ', 'elementor' ) }
									button={ {
										text: __( 'Continue browsing.', 'elementor' ),
										action: clearQueryParams,
										category: path,
									} }
								/>,
								isFilterActive,
							} )
						}
					</>
				</Content>
			</div>
		</Layout>
	);
}

Cloud.propTypes = {
	path: PropTypes.string,
	renderNoResultsComponent: PropTypes.func,
};
