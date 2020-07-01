import UiMenu from 'elementor-app/ui/menu/menu';
import { Context as TemplateTypesContext } from '../context/template-types';
import Button from 'elementor-app/ui/molecules/button';

export default function Menu( props ) {
	const { templateTypes } = React.useContext( TemplateTypesContext ),
		ActionButton = <Button text="Locked" hideText={true} icon="eicon-lock" className="e-app-menu-item__action-button"/>;

	return (
		<UiMenu menuItems={ templateTypes } actionButton={ ActionButton }>
			<>
				{ props.allPartsButton }
				<div className="e-app-menu__title u-mt-44 u-mb-16">
					{ __( 'Site Parts', 'elementor' ) }
				</div>
			</>
		</UiMenu>
	);
}

Menu.propTypes = {
	allPartsButton: PropTypes.element.isRequired,
};
