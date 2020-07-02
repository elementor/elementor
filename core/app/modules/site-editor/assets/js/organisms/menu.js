import UiMenu from 'elementor-app/ui/menu/menu';
import { Context as TemplateTypesContext } from '../context/template-types';
import Button from 'elementor-app/ui/molecules/button';
import AddNewButton from 'elementor-app/ui/molecules/add-new-button';

export default function Menu( props ) {
	const { templateTypes } = React.useContext( TemplateTypesContext ),
		actionButton = ( itemProps ) => {
			const className = 'e-app-menu-item__action-button';

			if ( props.promotion ) {
				return <Button text="Locked" hideText={true} icon="eicon-lock" className={className} />;
			}

			const onHoverClick = () => {
				location.href = itemProps.urls.create;
			};

			return (
				<span className={className}>
					<AddNewButton hideText={true} size="sm" onClick={ () => onHoverClick() }/>
				</span>
			);
		};

	return (
		<UiMenu menuItems={ templateTypes } actionButton={ actionButton }>
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
	promotion: PropTypes.bool,
};
