/* eslint-disable react/prop-types */

import {
	Button,
	CheckboxControl,
	Dropdown,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const toggleRoleRestrictions = ( widgetName, roleId, widgetsRoleRestrictions, setWidgetsRoleRestrictions ) => {
	const widgetRoleRestrictions = widgetsRoleRestrictions[ widgetName ] || [];

	if ( widgetRoleRestrictions.includes( roleId ) ) {
		widgetRoleRestrictions.splice( widgetRoleRestrictions.indexOf( roleId ), 1 );
	} else {
		widgetRoleRestrictions.push( roleId );
	}

	// TODO: Remove the object from the state if it's empty
	setWidgetsRoleRestrictions( {
		...widgetsRoleRestrictions,
		[ widgetName ]: widgetRoleRestrictions,
	} );
};

const RolesList = ( props ) => {
	const { roles, widgetRoleRestrictions } = props;

	const rolesEnables = roles.filter( ( role ) => {
		return ! widgetRoleRestrictions.includes( role.id );
	} );

	if ( ! rolesEnables.length ) {
		return (
			<>
				({ __( 'Admin', 'elementor' ) })
			</>
		);
	}

	if ( rolesEnables.length === roles.length ) {
		return (
			<>
				({ __( 'All Roles', 'elementor' ) })
			</>
		);
	}

	return (
		<>
			({ rolesEnables.map( ( role ) => {
				return role.name;
			} ).join( ', ' ) })
		</>
	);
};

export const RolePermissions = ( props ) => {
	const { roles, widgetName, widgetsRoleRestrictions, setWidgetsRoleRestrictions } = props;

	const widgetRoleRestrictions = widgetsRoleRestrictions[ widgetName ] || [];

	return (
		<>
			<Dropdown
				className={ 'my-container-class-name' }
				contentClassName={ 'my-dropdown-content-classname' }
				popoverProps={ { placement: 'bottom-start' } }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<>
						<Button
							variant={ 'link' }
							onClick={ onToggle }
							aria-expanded={ isOpen }
							style={ {
								textDecoration: 'none',
							} }
						>
							{ __( 'Edit', 'elementor' ) }
						</Button>
						{ ' ' }
						<span
							style={ {
								color: 'var(--e-a-color-txt-muted)',
							} }
						>
							<RolesList
								roles={ roles }
								widgetRoleRestrictions={ widgetRoleRestrictions }
							/>
						</span>
					</>
				) }
				renderContent={ () => {
					const isAllChecked = roles.every( ( role ) => ! widgetRoleRestrictions.includes( role.id ) );
					const isIndeterminate = ! isAllChecked && roles.some( ( role ) => ! widgetRoleRestrictions.includes( role.id ) );

					return (
						<div style={ {
							minWidth: '150px',
							paddingInline: '10px',
							paddingBlockStart: '10px',
						} }>
							<CheckboxControl
								checked={ isAllChecked }
								indeterminate={ isIndeterminate }
								label={ 'All' }
								onChange={ ( value ) => {
									if ( value ) {
										setWidgetsRoleRestrictions( {
											...widgetsRoleRestrictions,
											[ widgetName ]: [],
										} );
									} else {
										setWidgetsRoleRestrictions( {
											...widgetsRoleRestrictions,
											[ widgetName ]: roles.map( ( role ) => role.id ),
										} );
									}
								} }
							/>
							{ roles.map( ( role ) => {
								return (
									<div key={ role.id }>
										<CheckboxControl
											checked={ ! widgetRoleRestrictions.includes( role.id ) }
											label={ role.name }
											onChange={ () => {
												toggleRoleRestrictions( widgetName, role.id, widgetsRoleRestrictions, setWidgetsRoleRestrictions );
											} }
										/>
									</div>
								);
							} ) }
						</div>
					);
				} }
			/>
		</>
	);
};

export const EditButtonDisabled = () => {
	return (
		<>
			<Button
				variant="link"
				disabled
				style={ {
					textDecoration: 'none',
				} }
			>
				{ __( 'Edit', 'elementor' ) }
			</Button>
		</>
	);
};
