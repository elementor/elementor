import { MenuItem } from '@elementor/app-ui';

export default function IndexSidebar() {
	return (
		<div>
			<MenuItem
				text={__( 'All Kits', 'elementor' )}
				className="eps-menu-item__link eps-menu-item--active"
				icon="eicon-filter"
				url="/kit-library"
			/>
		</div>
	);
}
