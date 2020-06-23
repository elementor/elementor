import UiMenu from 'elementor-app/ui/menu/menu';
import { Context as TemplateTypesContext } from '../context/template-types';
import MenuItem from 'elementor-app/ui/menu/menu-item';
import Button from 'elementor-app/ui/molecules/button';

export default function Menu() {
	const { templateTypes } = React.useContext( TemplateTypesContext ),
		ActionButton = <Button text="Locked" hideText={true} icon="eicon-lock" className="e-app-menu-item__action-button"/>;

	return (
		<UiMenu menuItems={ templateTypes } actionButton={ ActionButton }>
			<>
				<MenuItem id="all-parts" text={ __( 'All Parts', 'elementor' ) } className="e-app-menu-item--active e-app-menu-item__link" icon="eicon-filter" url="/site-editor/templates" />
				<div className="e-app-menu__title u-mt-44 u-mb-16">
					{ __( 'Site Parts', 'elementor' ) }
				</div>
			</>
		</UiMenu>
	);
}
