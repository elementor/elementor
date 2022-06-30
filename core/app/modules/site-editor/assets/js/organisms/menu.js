import UiMenu from 'elementor-app/ui/menu/menu';
import { Context as TemplateTypesContext } from '../context/template-types';
import Button from 'elementor-app/ui/molecules/button';
import AddNewButton from 'elementor-app/ui/molecules/add-new-button';

import './menu.scss';

export default function Menu( props ) {
	const { templateTypes } = React.useContext( TemplateTypesContext ),
		actionButton = ( itemProps ) => {
			const className = 'eps-menu-item__action-button';

			if ( props.promotion ) {
				return <Button text={ __( 'Go Pro', 'elementor' ) } hideText icon="eicon-lock" className={ className } />;
			}

			const goToCreate = () => {
				location.href = itemProps.urls.create;
			};

			return (
				<span className={ className }>
					<AddNewButton hideText={ true } size="sm" onClick={ () => goToCreate() } />
				</span>
			);
		};

	return (
		<UiMenu menuItems={ templateTypes } actionButton={ actionButton } promotion={ props.promotion }>
			{ props.allPartsButton }
			<div className="eps-menu__title">
				{ __( 'Site Parts', 'elementor' ) }
			</div>
		</UiMenu>
	);
}

Menu.propTypes = {
	allPartsButton: PropTypes.element.isRequired,
	promotion: PropTypes.bool,
};
