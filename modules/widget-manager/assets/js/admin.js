import {useEffect, render, useState,} from '@wordpress/element';
import {Button, ToggleControl, Spinner, SearchControl} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import domReady from '@wordpress/dom-ready';

const saveDisabledWidgets = async ( widgetsDisabled ) => {
	try {
		const response = await fetch( eWidgetManagerConfig.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams( {
				action: 'elementor_widget_manager_save_disabled_widgets',
				nonce: eWidgetManagerConfig.nonce,
				widgets: JSON.stringify( widgetsDisabled ),
			} ),
		} );

		const data = await response.json();

		console.log(data);
	} catch ( error ) {
		console.log( error );
	}
};

const getAdminAppData = async () => {
	try {
		const response = await fetch( eWidgetManagerConfig.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams( {
				action: 'elementor_widget_manager_get_admin_app_data',
				nonce: eWidgetManagerConfig.nonce,
			} ),
		} );

		const data = await response.json();
		if ( data.success ) {
			return data.data;
		}
	} catch ( error ) {
		console.log( error );
	}
};

const App = () => {
	const [ isLoading, setIsLoading ] = useState( true );
	const [ searchKeyword, setSearchKeyword ] = useState( '' );
	const [ widgets, setWidgets ] = useState( [] );
	const [ widgetsDisabled, setWidgetsDisabled ] = useState( [] );

	const onSaveClicked = async () => {
		await saveDisabledWidgets( widgetsDisabled );
		console.log( widgetsDisabled );
	};

	useEffect( () => {
		const onLoading = async () => {
			const appData = await getAdminAppData();

			setWidgetsDisabled( appData.disabled_widgets );
			setWidgets( appData.widgets );

			setIsLoading( false );
		};

		onLoading();
	}, [] );

	if ( isLoading ) {
		return (
			<div><Spinner /> { __( 'Loading...', 'elementor' ) }</div>
		);
	}

	return (
		<>
			<h1>Widget Manager Wrap</h1>

			<div>
				<Button
					variant="primary"
					onClick={ onSaveClicked }
				>
					{ __( 'Save Changes', 'elementor' ) }
				</Button>
			</div>

			<div>
				<SearchControl
					help="Help text to explain the input."
					label="Label Text"
					value={ searchKeyword }
					onChange={ setSearchKeyword }
				/>
			</div>

			<table className={'wp-list-table widefat fixed striped table-view-list'}>
				<thead>
					<tr>
						<th>{ __( 'Widget', 'elementor' ) }</th>
						<th>{ __( 'Plugin', 'elementor' ) }</th>
						<th>{ __( 'Enabled', 'elementor' ) }</th>
					</tr>
				</thead>
				<tbody>
				{ widgets.map( ( widget ) => {
					if ( ! widget.title.toLowerCase().includes( searchKeyword.toLowerCase() ) ) {
						return null;
					}

					return (
						<tr key={ widget.name }>
							<td>{ widget.title }</td>
							<td>{ widget.plugin }</td>
							<td>
								<ToggleControl
									checked={ ! widgetsDisabled.includes( widget.name ) }
									onChange={ () => {
										if ( widgetsDisabled.includes( widget.name ) ) {
											setWidgetsDisabled( widgetsDisabled.filter( ( item ) => item !== widget.name ) );
										} else {
											setWidgetsDisabled( [ ...widgetsDisabled, widget.name ] );
										}
									} }
								/>
							</td>
						</tr>
					);
				} ) }
				</tbody>
			</table>

			<div>
				<Button
					variant="primary"
					onClick={ onSaveClicked }
				>
					{ __( 'Save Changes', 'elementor' ) }
				</Button>
			</div>
		</>
	);
}

domReady( () => {
	const htmlOutput = document.getElementById( 'elementor-widget-manager-wrap' );

	if ( htmlOutput ) {
		render( <App />, htmlOutput );
	}
} );

