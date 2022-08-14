import Content from '../../../../../../assets/js/layout/content';
import EnvatoPromotion from '../../components/envato-promotion';
import ErrorScreen from '../../components/error-screen';
import FilterIndicationText from '../../components/filter-indication-text';
import IndexHeader from './index-header';
import IndexSidebar from './index-sidebar';
import KitList from '../../components/kit-list';
import Layout from '../../components/layout';
import PageLoader from '../../components/page-loader';
import SearchInput from '../../components/search-input';
import SortSelect from '../../components/sort-select';
import TaxonomiesFilter from '../../components/taxonomies-filter';
import useKits, { defaultQueryParams } from '../../hooks/use-kits';
import usePageTitle from 'elementor-app/hooks/use-page-title';
import useTaxonomies from '../../hooks/use-taxonomies';
import { Grid } from '@elementor/app-ui';
import { useCallback, useMemo, useEffect } from 'react';
import { useLastFilterContext } from '../../context/last-filter-context';
import { useLocation } from '@reach/router';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

import './index.scss';

/**
 * Generate select and unselect taxonomy functions.
 *
 * @param {Function} setQueryParams
 * @return {((function(*, *): *)|(function(*=): *))[]} taxonomy functions
 */
function useTaxonomiesSelection( setQueryParams ) {
	const selectTaxonomy = useCallback( ( type, callback ) => setQueryParams(
		( prev ) => {
			const taxonomies = { ...prev.taxonomies };

			taxonomies[ type ] = callback( prev.taxonomies[ type ] );

			return { ...prev, taxonomies };
		},
	), [ setQueryParams ] );

	const unselectTaxonomy = useCallback( ( taxonomy ) => setQueryParams( ( prev ) => {
		const taxonomies = Object.entries( prev.taxonomies )
			.reduce( ( current, [ key, groupedTaxonomies ] ) => ( {
				...current,
				[ key ]: groupedTaxonomies.filter( ( item ) => item !== taxonomy ),
			} ), {} );

		return { ...prev, taxonomies };
	} ), [ setQueryParams ] );

	return [ selectTaxonomy, unselectTaxonomy ];
}

/**
 * Generate the menu items for the index page.
 *
 * @param {string} path
 * @return {Array} menu items
 */
function useMenuItems( path ) {
	return useMemo( () => {
		const page = path.replace( '/', '' );

		return [
			{
				label: __( 'All Website Kits', 'elementor' ),
				icon: 'eicon-filter',
				isActive: ! page,
				url: '/kit-library',
				trackEventData: { command: 'kit-library/select-organizing-category', category: 'all' },
			},
			{
				label: __( 'Favorites', 'elementor' ),
				icon: 'eicon-heart-o',
				isActive: 'favorites' === page,
				url: '/kit-library/favorites',
				trackEventData: { command: 'kit-library/select-organizing-category', category: 'favorites' },
			},
		];
	}, [ path ] );
}

/**
 * Update and read the query param from the url
 *
 * @param {*}             queryParams
 * @param {*}             setQueryParams
 * @param {Array<string>} exclude
 */
function useRouterQueryParams( queryParams, setQueryParams, exclude = [] ) {
	const location = useLocation(),
		{ setLastFilter } = useLastFilterContext();

	useEffect( () => {
		const filteredQueryParams = Object.fromEntries(
			Object.entries( queryParams )
				.filter( ( [ key, item ] ) => ! exclude.includes( key ) && item ),
		);

		setLastFilter( filteredQueryParams );

		history.replaceState(
			null,
			'',
			decodeURI(
				`#${ wp.url.addQueryArgs( location.pathname.split( '?' )[ 0 ] || '/', filteredQueryParams ) }`,
			),
		);
	}, [ queryParams ] );

	useEffect( () => {
		const routerQueryParams = Object.keys( defaultQueryParams ).reduce( ( current, key ) => {
			// TODO: Replace with `wp.url.getQueryArgs` when WordPress 5.7 is the min version
			const queryArg = wp.url.getQueryArg( location.pathname, key );

			if ( ! queryArg ) {
				return current;
			}

			return {
				...current,
				[ key ]: queryArg,
			};
		}, {} );

		setQueryParams( ( prev ) => ( {
			...prev,
			...routerQueryParams,
			taxonomies: {
				...prev.taxonomies,
				...routerQueryParams.taxonomies,
			},
			ready: true,
		} ) );
	}, [] );
}

export default function Index( props ) {
	usePageTitle( {
		title: __( 'Kit Library', 'elementor' ),
	} );

	const menuItems = useMenuItems( props.path );

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
	} = useKits( props.initialQueryParams );

	useRouterQueryParams( queryParams, setQueryParams, [ 'ready', ...Object.keys( props.initialQueryParams ) ] );

	const {
		data: taxonomiesData,
		forceRefetch: forceRefetchTaxonomies,
		isFetching: isFetchingTaxonomies,
	} = useTaxonomies();

	const [ selectTaxonomy, unselectTaxonomy ] = useTaxonomiesSelection( setQueryParams );

	const eventTracking = ( command, elementPosition, search = null, direction = null, sortType = null, action = null, eventType = 'click' ) => {
		appsEventTrackingDispatch(
			command,
			{
				page_source: 'home page',
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
				<IndexSidebar
					tagsFilterSlot={ <TaxonomiesFilter
						selected={ queryParams.taxonomies }
						onSelect={ selectTaxonomy }
						taxonomies={ taxonomiesData }
						category={ props.path }
					/> }
					menuItems={ menuItems }
				/>
			}
			header={
				<IndexHeader
					refetch={ () => {
						forceRefetch();
						forceRefetchTaxonomies();
					} }
					isFetching={ isFetching || isFetchingTaxonomies }
				/>
			}
		>
			<div className="e-kit-library__index-layout-container">
				<Grid container className="e-kit-library__index-layout-top-area">
					<Grid item className="e-kit-library__index-layout-top-area-search">
						<SearchInput
							// eslint-disable-next-line @wordpress/i18n-ellipsis
							placeholder={ __( 'Search all Website Kits...', 'elementor' ) }
							value={ queryParams.search }
							onChange={ ( value ) => {
								setQueryParams( ( prev ) => ( { ...prev, search: value } ) );
								eventTracking( 'kit-library/kit-free-search', 'top_area_search', value, null, null, null, 'search' );
							} }
						/>
						{ isFilterActive && <FilterIndicationText
							queryParams={ queryParams }
							resultCount={ data.length || 0 }
							onClear={ clearQueryParams }
							onRemoveTag={ unselectTaxonomy }
						/> }
					</Grid>
					<Grid
						item
						className="e-kit-library__index-layout-top-area-sort"
					>
						<SortSelect
							options={ [
								{
									label: __( 'Featured', 'elementor' ),
									value: 'featuredIndex',
									defaultOrder: 'asc',
									orderDisabled: true,
								},
								{
									label: __( 'New', 'elementor' ),
									value: 'createdAt',
									defaultOrder: 'desc',
								},
								{
									label: __( 'Popular', 'elementor' ),
									value: 'popularityIndex',
									defaultOrder: 'desc',
								},
								{
									label: __( 'Trending', 'elementor' ),
									value: 'trendIndex',
									defaultOrder: 'desc',
								},
							] }
							value={ queryParams.order }
							onChange={ ( order ) => setQueryParams( ( prev ) => ( { ...prev, order } ) ) }
							onChangeSortDirection={ ( direction ) => eventTracking( 'kit-library/change-sort-direction', 'top_area_sort', null, direction ) }
							onChangeSortValue={ ( value ) => eventTracking( 'kit-library/change-sort-value', 'top_area_sort', null, null, value ) }
							onSortSelectOpen={ () => eventTracking( 'kit-library/change-sort-type', 'top_area_sort', null, null, null, 'expand' ) }
						/>
					</Grid>
				</Grid>
				<Content className="e-kit-library__index-layout-main">
					<>
						{ isLoading && <PageLoader /> }
						{
							isError && <ErrorScreen
								title={ __( 'Something went wrong.', 'elementor' ) }
								description={ __( 'Nothing to worry about, use 🔄 on the top right to try again. If the problem continues, head over to the Help Center.', 'elementor' ) }
								button={ {
									text: __( 'Learn More', 'elementor' ),
									url: 'http://go.elementor.com/app-kit-library-error/',
									target: '_blank',
								} }
							/>
						}
						{ isSuccess && 0 < data.length && queryParams.ready && <KitList data={ data } queryParams={ queryParams } source={ props.path } /> }
						{
							isSuccess && 0 === data.length && queryParams.ready && props.renderNoResultsComponent( {
								defaultComponent: <ErrorScreen
									title={ __( 'No results matched your search.', 'elementor' ) }
									description={ __( 'Try different keywords or ', 'elementor' ) }
									button={ {
										text: __( 'Continue browsing.', 'elementor' ),
										action: clearQueryParams,
										category: props.path,
									} }
								/>,
								isFilterActive,
							} )
						}
						<EnvatoPromotion category={ props.path } />
					</>
				</Content>
			</div>
		</Layout>
	);
}

Index.propTypes = {
	path: PropTypes.string,
	initialQueryParams: PropTypes.object,
	renderNoResultsComponent: PropTypes.func,
};

Index.defaultProps = {
	initialQueryParams: {},
	renderNoResultsComponent: ( { defaultComponent } ) => defaultComponent,
};
