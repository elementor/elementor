const { useState, useEffect } = React;
import { Toolbar, ToolbarDropdownMenu } from '@wordpress/components';

/**
 * TODO: Super ugly temporary code. Don't bother reviewing this.
 */
export default class FloatingBarHandler extends elementorModules.frontend.handlers.Base {
	isActive() {
		return elementorFrontend.isEditMode();
	}

	getContainer() {
		return elementor.getContainer( this.getID() );
	}

	onInit() {
		if ( ! this.isActive() ) {
			return;
		}

		const floatingBar = document.createElement( 'div' );
		floatingBar.classList.add( 'e-floating-bar' );
		this.$element[ 0 ].appendChild( floatingBar );

		const container = this.getContainer(),
			model = container.model,
			floatingBarConfig = {
			...container.view.getFloatingBarConfig(),
			elType: model.get( 'widgetType' ) || model.get( 'elType' ),
		};

		ReactDOM.render( <FloatingBar config={ floatingBarConfig } container={ this.getContainer() } />, floatingBar );
	}
}

function FloatingBar( props ) {
	const [ activeSettings, setActiveSettings ] = useState( {} ),
		[ visible, setVisible ] = useState( false ),
		{ config, container } = props,
		widgetSettings = elementor.widgetsCache[ config.elType ];

	container.view.setFloatingBarVisible = setVisible;
	container.view.setFloatingBarActiveSettings = setActiveSettings;

	const dropdowns = [];
	const tmp = {};

	Object.keys( config.groups.container.settings ).forEach( ( setting ) => {
		const control = widgetSettings.controls[ setting ],
			options = [];

		Object.entries( control.options ).forEach( ( [ value, label ] ) => {
			options.push( {
				title: label.title || label,
				icon: label.icon || '',
				value: value,
				setting,
			} );
		} );

		dropdowns.push( {
			id: setting,
			label: control.label,
			controls: mapControls( options, container, setActiveSettings ),
		} );

		tmp[ setting ] = container.settings.get( setting );
	} );

	useEffect( () => {
		setActiveSettings( tmp );
	}, [] );

	return ( visible &&
		<Toolbar label="Flex Container">
			{
				dropdowns.map( ( dropdown ) => {
					return (
						<ToolbarDropdownMenu key={ dropdown.id }
							icon={ getIcon( dropdown, activeSettings ) }
							controls={ dropdown.controls } />
                    );
				} )
			}
		</Toolbar>
	);
}

function Eicon( props ) {
	return (
		<i className={ props.icon }></i>
	);
}

function mapControls( controls, container, setActive ) {
	return controls.map( ( control ) => {
		control.icon = <Eicon icon={ control.icon } />;
		control.onClick = () => {
			setActive( ( prev ) => {
				return {
					...prev,
					[ control.setting ]: control.value,
				};
			} );

			window.top.$e.run( 'document/elements/settings', {
				container,
				settings: {
					[ control.setting ]: control.value,
				},
				options: { external: true },
			} );
		};

		return control;
	} );
}

function getIcon( dropdown, active ) {
	return (
		dropdown.controls.find( ( c ) => active[ dropdown.id ] === c.value ) ||
		dropdown.controls[ 0 ]
	).icon;
}

FloatingBar.propTypes = {
	config: PropTypes.object.isRequired,
	container: PropTypes.object.isRequired,
};

Eicon.propTypes = {
	icon: PropTypes.string.isRequired,
};
