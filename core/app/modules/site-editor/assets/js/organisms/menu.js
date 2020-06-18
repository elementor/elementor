import UiMenu from 'elementor-app/ui/menu/menu';
import { Context as TemplateTypesContext } from '../context/template-types';
import MenuItem from 'elementor-app/ui/menu/menu-item';

export default function Menu() {
	const { templateTypes } = React.useContext( TemplateTypesContext );

	return (
		<UiMenu menuItems={ templateTypes }>
			<>
				<MenuItem id="all-parts" text={ __( 'All Parts', 'elementor' ) } className="e-app-menu-item--active" icon="eicon-filter" url="/site-editor/templates" />
				<div className="e-app-menu__title u-mt-44 u-mb-16">
					{ __( 'Site Parts', 'elementor' ) }
				</div>
			</>
		</UiMenu>
	);
}
