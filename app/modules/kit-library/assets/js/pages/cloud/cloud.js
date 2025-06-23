import Content from '../../../../../../assets/js/layout/content';
import ErrorScreen from '../../components/error-screen';
import IndexHeader from '../index/index-header';
import IndexSidebar from '../index/index-sidebar';
import KitListCloud from '../../components/kit-list-cloud';
import Layout from '../../components/layout';
import SearchInput from '../../components/search-input';
import useCloudKits from '../../hooks/use-cloud-kits';
import useCloudKitsEligibility from 'elementor-app/hooks/use-cloud-kits-eligibility';
import useMenuItems from '../../hooks/use-menu-items';
import useConnectState from '../../hooks/use-connect-state';
import usePageTitle from 'elementor-app/hooks/use-page-title';
import { Grid } from '@elementor/app-ui';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import ConnectScreen from './connect-screen';
import UpgradeScreen from './upgrade-screen';
import FullPageLoader from './full-page-loader';

import '../index/index.scss';

export default function Cloud( {
	path = '',
	renderNoResultsComponent = ( { defaultComponent } ) => defaultComponent,
} ) {
	usePageTitle( {
		title: __( 'Website Templates', 'elementor' ),
	} );

	const { isConnected, isConnecting, setConnecting, handleConnectSuccess, handleConnectError } = useConnectState();

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

	const { data: isCloudKitsAvailable, isLoading: isCheckingEligibility, refetch: refetchEligibility } = useCloudKitsEligibility( {
		enabled: isConnected,
	} );

	const menuItems = useMenuItems( path );

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

	const onConnectSuccess = () => {
		refetchEligibility();
		forceRefetch();
		handleConnectSuccess();
	};

	const onConnectError = () => {
		handleConnectError();
	};

	const shouldShowLoading = isConnecting || isCheckingEligibility || ( isConnected && isLoading );

	useEffect( () => {
		if ( isConnecting && ! isCheckingEligibility && ! isLoading ) {
			setConnecting( false );
		}
	}, [ isConnecting, isCheckingEligibility, isLoading, setConnecting ] );

	if ( ! isConnected ) {
		return (
			<ConnectScreen
				onConnectSuccess={ onConnectSuccess }
				onConnectError={ onConnectError }
				menuItems={ menuItems }
				forceRefetch={ forceRefetch }
				isFetching={ isFetching }
			/>
		);
	}

	if ( shouldShowLoading ) {
		return (
			<FullPageLoader
				menuItems={ menuItems }
				forceRefetch={ forceRefetch }
				isFetching={ isFetching }
			/>
		);
	}

	if ( ! isCloudKitsAvailable && ! shouldShowLoading ) {
		return (
			<UpgradeScreen
				menuItems={ menuItems }
				forceRefetch={ forceRefetch }
				isFetching={ isFetching }
			/>
		);
	}

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
							placeholder={ __( 'Search my Website Templates...', 'elementor' ) }
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
										title={ __( 'No Website Templates found for your search', 'elementor' ) }
										description={ __( 'Try different keywords or ', 'elementor' ) }
										button={ {
											text: __( 'Continue browsing.', 'elementor' ),
											action: clearQueryParams,
										} }
									/>
								) : (
									renderNoResultsComponent( {
										defaultComponent: <ErrorScreen
											title={ __( 'No Website Templates to show here yet', 'elementor' ) }
											description={ __( "Once you export a Website to the cloud, you'll find it here and be able to use it on all your sites.", 'elementor' ) }
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
