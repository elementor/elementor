import {
	Button,
	Box,
	Checkbox,
	FormControlLabel,
	Menu,
	MenuItem,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

const toggleRoleRestrictions = ( widgetName, roleId, widgetsRoleRestrictions, setWidgetsRoleRestrictions ) => {
	const widgetRoleRestrictions = [ ...( widgetsRoleRestrictions[ widgetName ] || [] ) ];

	if ( widgetRoleRestrictions.includes( roleId ) ) {
		widgetRoleRestrictions.splice( widgetRoleRestrictions.indexOf( roleId ), 1 );
	} else {
		widgetRoleRestrictions.push( roleId );
	}

	setWidgetsRoleRestrictions( {
		...widgetsRoleRestrictions,
		[ widgetName ]: widgetRoleRestrictions,
	} );
};

const RolesList = ( { roles, widgetRoleRestrictions } ) => {
	const rolesEnabled = roles.filter( ( role ) => ! widgetRoleRestrictions.includes( role.id ) );

	if ( ! rolesEnabled.length ) {
		return (
			<Typography component="span" variant="body2" color="text.primary">
				({ __( 'Admin', 'elementor' ) })
			</Typography>
		);
	}

	if ( rolesEnabled.length === roles.length ) {
		return (
			<Typography component="span" variant="body2" color="text.primary">
				({ __( 'All Roles', 'elementor' ) })
			</Typography>
		);
	}

	return (
		<Typography component="span" variant="body2" color="text.primary">
			({ rolesEnabled.map( ( role ) => role.name ).join( ', ' ) })
		</Typography>
	);
};

RolesList.propTypes = {
	roles: PropTypes.arrayOf( PropTypes.shape( {
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
	} ) ).isRequired,
	widgetRoleRestrictions: PropTypes.arrayOf( PropTypes.string ).isRequired,
};

export const RolePermissions = ( {
	roles,
	widgetName,
	widgetsRoleRestrictions,
	setWidgetsRoleRestrictions,
} ) => {
	const [ anchorEl, setAnchorEl ] = useState( null );
	const isOpen = Boolean( anchorEl );

	const widgetRoleRestrictions = widgetsRoleRestrictions[ widgetName ] || [];

	const handleClick = useCallback( ( event ) => {
		setAnchorEl( event.currentTarget );
	}, [] );

	const handleClose = useCallback( () => {
		setAnchorEl( null );
	}, [] );

	const isAllChecked = roles.every( ( role ) => ! widgetRoleRestrictions.includes( role.id ) );
	const isIndeterminate = ! isAllChecked && roles.some( ( role ) => ! widgetRoleRestrictions.includes( role.id ) );

	const handleAllChange = useCallback( ( event ) => {
		if ( event.target.checked ) {
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
	}, [ widgetName, widgetsRoleRestrictions, setWidgetsRoleRestrictions, roles ] );

	return (
		<Box sx={ { display: 'inline-flex', alignItems: 'center', gap: 0.5 } }>
			<Button
				variant="text"
				color="secondary"
				size="small"
				onClick={ handleClick }
				aria-expanded={ isOpen }
				aria-haspopup="true"
				className={ `e-id-elementor-element-manager-button-edit-permissions-${ widgetName }` }
			>
				{ __( 'Edit', 'elementor' ) }
			</Button>
			<RolesList
				roles={ roles }
				widgetRoleRestrictions={ widgetRoleRestrictions }
			/>
			<Menu
				anchorEl={ anchorEl }
				open={ isOpen }
				onClose={ handleClose }
				anchorOrigin={ {
					vertical: 'bottom',
					horizontal: 'left',
				} }
				transformOrigin={ {
					vertical: 'top',
					horizontal: 'left',
				} }
			>
				<MenuItem sx={ { py: 0.5 } }>
					<FormControlLabel
						control={
							<Checkbox
								checked={ isAllChecked }
								indeterminate={ isIndeterminate }
								onChange={ handleAllChange }
								size="small"
								color="secondary"
							/>
						}
						label={ __( 'All', 'elementor' ) }
					/>
				</MenuItem>
				{ roles.map( ( role ) => (
					<MenuItem key={ role.id } sx={ { py: 0.5 } }>
						<FormControlLabel
							control={
								<Checkbox
									color="secondary"
									checked={ ! widgetRoleRestrictions.includes( role.id ) }
									onChange={ () => {
										toggleRoleRestrictions(
											widgetName,
											role.id,
											widgetsRoleRestrictions,
											setWidgetsRoleRestrictions,
										);
									} }
									size="small"
								/>
							}
							label={ role.name }
						/>
					</MenuItem>
				) ) }
			</Menu>
		</Box>
	);
};

RolePermissions.propTypes = {
	roles: PropTypes.arrayOf( PropTypes.shape( {
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
	} ) ).isRequired,
	widgetName: PropTypes.string.isRequired,
	widgetsRoleRestrictions: PropTypes.oneOfType( [ PropTypes.object, PropTypes.array ] ).isRequired,
	setWidgetsRoleRestrictions: PropTypes.func.isRequired,
};

export const EditButtonDisabled = ( { widgetName = 'unknown' } ) => {
	return (
		<Button
			variant="text"
			color="secondary"
			size="small"
			disabled
			className={ `e-id-elementor-element-manager-button-edit-permissions-${ widgetName }` }
		>
			{ __( 'Edit', 'elementor' ) }
		</Button>
	);
};

EditButtonDisabled.propTypes = {
	widgetName: PropTypes.string,
};

