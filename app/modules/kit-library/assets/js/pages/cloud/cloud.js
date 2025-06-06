import Content from '../../../../../../assets/js/layout/content';
import ErrorScreen from '../../components/error-screen';
import IndexHeader from '../index/index-header';
import IndexSidebar from '../index/index-sidebar';
import KitListCloud from '../../components/kit-list-cloud';
import Layout from '../../components/layout';
import PageLoader from '../../components/page-loader';
import SearchInput from '../../components/search-input';
import useCloudKits from '../../hooks/use-cloud-kits';
import useMenuItems from '../../hooks/use-menu-items';
import usePageTitle from 'elementor-app/hooks/use-page-title';
import { Grid } from '@elementor/app-ui';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';
import PropTypes from 'prop-types';

import '../index/index.scss';

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
	} = useCloudKits();

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
							isSuccess && 0 === data.length && (
								queryParams.search ? (
									<ErrorScreen
										title={ __( 'No kits found for your search', 'elementor' ) }
										description={ __( 'Try different keywords or ', 'elementor' ) }
										button={ {
											text: __( 'Continue browsing.', 'elementor' ),
											action: clearQueryParams,
										} }
									/>
								) : (
									renderNoResultsComponent( {
										defaultComponent: <ErrorScreen
											title={ __( 'No kits to show here yet', 'elementor' ) }
											description={ __( "Once you export a Website Kit to the cloud, you'll find it here and be able to use it on all your sites.", 'elementor' ) }
											newLineButton={ true }
											button={ {
												text: __( 'Export this site', 'elementor' ),
												url: elementorAppConfig.base_url + '#/export',
												target: '_blank',
												variant: 'contained',
												color: 'primary',
											} }
										/>,
										isFilterActive,
									} )
								)
							)
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
