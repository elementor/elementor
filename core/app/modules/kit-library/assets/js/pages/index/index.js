import Content from '../../../../../../assets/js/layout/content';
import environment from 'elementor-common/utils/environment';
import FilterIndicationText from '../../components/filter-indication-text';
import IndexHeader from './index-header';
import IndexNoResults from './index-no-results';
import IndexSidebar from './index-sidebar';
import KitList from '../../components/kit-list';
import Layout from '../../components/layout';
import TaxonomiesFilter from '../../components/taxonomies-filter';
import useKits from '../../hooks/use-kits';
import useTaxonomies from '../../hooks/use-taxonomies';
import { SearchInput, Grid, SortSelect } from '@elementor/app-ui';
import { useCallback } from 'react';

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
		sort,
		setSort,
		forceRefetch,
	} = useKits();

	const {
		data: taxonomiesData,
		forceRefetch: forceRefetchTaxonomies,
		isFetching: isFetchingTaxonomies,
	} = useTaxonomies();

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
					</Grid>
					<Grid
						item
						className={ `e-kit-library__index-layout-top-area-sort ${ environment.safari ? 'e-kit-library__index-layout-top-area-sort--safari-support' : '' }` }
					>
						<SortSelect
							options={ [
								{ label: 'New', value: 'createdAt' },
								{ label: 'Popular', value: 'popularityIndex' },
								{ label: 'Trending', value: 'trendIndex' },
							] }
							value={ sort }
							onChange={ setSort }
						/>
					</Grid>
				</Grid>
				<Content className="e-kit-library__index-layout-main">
					<>
						{ isLoading && __( 'Loading...', 'elementor' ) }
						{ isError && __( 'An error occurred', 'elementor' ) }
						{ isSuccess && data.length > 0 && <KitList data={ data }/> }
						{ isSuccess && data.length <= 0 && <IndexNoResults/> }
					</>
				</Content>
			</div>
		</Layout>
	);
}
