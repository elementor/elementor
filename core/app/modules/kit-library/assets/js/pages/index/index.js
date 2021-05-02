import Content from '../../../../../../assets/js/layout/content';
import FilterIndicationText from '../../components/filter-indication-text';
import IndexHeader from './index-header';
import IndexNoResults from './index-no-results';
import IndexSidebar from './index-sidebar';
import KitList from '../../components/kit-list';
import Layout from '../../components/layout';
import TaxonomiesFilter from '../../components/taxonomies-filter';
import useKits, { initialFilterState } from '../../hooks/use-kits';
import useTaxonomies from '../../hooks/use-taxonomies';
import { SearchInput } from '@elementor/app-ui';
import { useCallback, useMemo } from 'react';

import './index.scss';

/**
 * Generate select and unselect taxonomy functions.
 *
 * @param setFilter
 * @returns {((function(*, *): *)|(function(*=): *))[]}
 */
function useTaxonomiesSelection( setFilter ) {
	const selectTaxonomy = useCallback( ( type, callback ) => setFilter(
		( prev ) => {
			const taxonomies = { ...prev.taxonomies };

			taxonomies[ type ] = callback( prev.taxonomies[ type ] );

			return { ...prev, taxonomies };
		}
	), [ setFilter ] );

	const unselectTaxonomy = useCallback( ( taxonomy ) => setFilter( ( prev ) => {
		const taxonomies = Object.entries( prev.taxonomies )
			.reduce( ( current, [ key, groupedTaxonomies ] ) => ( {
				...current,
				[ key ]: groupedTaxonomies.filter( ( item ) => item !== taxonomy ),
			} ), {} );

		return { ...prev, taxonomies };
	} ), [ setFilter ] );

	return [ selectTaxonomy, unselectTaxonomy ];
}

/**
 * Generate the menu items for the index page.
 *
 * @param filter
 * @param setFilter
 * @returns {[{onClick: function(): *, icon: string, label: *, isActive: boolean}, {onClick: function(): *, icon: string, label: *, isActive: boolean}]}
 */
function useMenuItems( filter, setFilter ) {
	const activeMenu = useMemo( () => {
		if ( filter.favorite ) {
			return 'favorite';
		}

		return 'all';
	}, [ filter ] );

	return useMemo( () => {
		return [
			{
				label: __( 'All Kits', 'elementor' ),
				icon: 'eicon-filter',
				isActive: 'all' === activeMenu,
				onClick: () => setFilter( { ...initialFilterState } ),
			},
			{
				label: __( 'Favorites', 'elementor' ),
				icon: 'eicon-heart-o',
				isActive: 'favorite' === activeMenu,
				onClick: () => setFilter( { ...initialFilterState, favorite: true } ),
			},
		];
	}, [ activeMenu, setFilter ] );
}

export default function Index() {
	const {
		data,
		isSuccess,
		isLoading,
		isFetching,
		isError,
		filter,
		setFilter,
		clearFilter,
		forceRefetch,
	} = useKits();

	const {
		data: taxonomiesData,
		forceRefetch: forceRefetchTaxonomies,
		isFetching: isFetchingTaxonomies,
	} = useTaxonomies();

	const menuItems = useMenuItems( filter, setFilter );

	const [ selectTaxonomy, unselectTaxonomy ] = useTaxonomiesSelection( setFilter );

	return (
		<Layout
			sidebar={
				<IndexSidebar
					tagsFilterSlot={ <TaxonomiesFilter
						selected={ filter.taxonomies }
						onSelect={ selectTaxonomy }
						taxonomies={ taxonomiesData }
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
				<div className="e-kit-library__index-layout-search-area">
					<div>
						<SearchInput
							placeholder={ __( 'Search a kit theme or style', 'elementor' ) }
							value={ filter.search }
							onChange={ ( value ) => setFilter( ( prev ) => ( { ...prev, search: value } ) ) }
						/>
						<FilterIndicationText
							filter={ filter }
							resultCount={ data.length || 0 }
							onClear={ clearFilter }
							onRemoveTag={ unselectTaxonomy }
						/>
					</div>
				</div>
				<Content className="e-kit-library__index-layout-main">
					<>
						{ isLoading && __( 'Loading...', 'elementor' ) }
						{ isError && __( 'An error occurred', 'elementor' ) }
						{ isSuccess && 0 < data.length && <KitList data={ data }/> }
						{
							isSuccess && 0 === data.length &&
								<IndexNoResults isFilteredByFavorite={ filter.favorite } clearFilter={ clearFilter }/>
						}
					</>
				</Content>
			</div>
		</Layout>
	);
}
