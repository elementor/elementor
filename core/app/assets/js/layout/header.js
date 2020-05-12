import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import Button from './header-button';

export default class Header extends React.Component {
	static propTypes = {
		title: PropTypes.string,
		buttons: PropTypes.arrayOf( PropTypes.object ),
	};

	render() {
		return (
			<div className="elementor-app__header dialog-header dialog-lightbox-header">
				<div className="elementor-templates-modal__header">
					<div className="elementor-templates-modal__header__logo-area">
						<div className="elementor-templates-modal__header__logo">
							<span className="elementor-templates-modal__header__logo__icon-wrapper elementor-gradient-logo">
								<i className="eicon-elementor" />
							</span>
							<span className="elementor-templates-modal__header__logo__title">
								{ this.props.title }
							</span>
						</div>
					</div>
					<div className="elementor-templates-modal__header__items-area">
						<Button
							id="close"
							text={ __( 'Close', 'elementor' ) }
							icon="eicon-close"
							className="elementor-templates-modal__header__close--normal"
							onClick={ () => $e.run( 'app/close' ) }
						/>
						{ this.getHeaderButtons() }
					</div>
				</div>
			</div>
		);
	}

	getHeaderButtons() {
		let headerButtons = '';

		if ( this.props.buttons.length ) {
			const buttons = this.props.buttons.map( ( button ) => {
				return <Button key={ button.id } {...button } />;
			} );

			headerButtons = (
				<div id="elementor-template-library-header-tools">
					<div id="elementor-template-library-header-actions">
						{ buttons }
					</div>
				</div>
			);
		}

		return headerButtons;
	}
}
