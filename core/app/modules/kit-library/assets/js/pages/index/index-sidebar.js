import { initialFilterState } from '../../hooks/use-kits';
import { MenuItem } from '@elementor/app-ui';

export default function IndexSidebar( props ) {
	return (
		<>
			<MenuItem
				text={ __( 'All Kits', 'elementor' ) }
				className={ `eps-menu-item__link ${ ! props.filter.favorite ? 'eps-menu-item--active' : '' }` }
				icon="eicon-filter"
				onClick={ () => props.filter.favorite && props.onChange( { ...initialFilterState } ) }
			/>
			<MenuItem
				text={ __( 'Favorites', 'elementor' ) }
				className={ `eps-menu-item__link ${ props.filter.favorite ? 'eps-menu-item--active' : '' }` }
				icon="eicon-heart-o"
				onClick={ () => ! props.filter.favorite && props.onChange( {
					...initialFilterState,
					favorite: true,
				} ) }
			/>
			{ props.tagsFilterSlot }
		</>
	);
}

IndexSidebar.propTypes = {
	tagsFilterSlot: PropTypes.node,
	onChange: PropTypes.func.isRequired,
	filter: PropTypes.object.isRequired,
};
