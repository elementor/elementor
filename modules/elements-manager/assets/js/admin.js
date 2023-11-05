import {useEffect, render, useState, useMemo} from '@wordpress/element';
import {Button, ToggleControl, Spinner, SearchControl, ButtonGroup, Panel, PanelBody, PanelRow, SelectControl, FlexItem, Flex, FlexBlock} from '@wordpress/components';
import {__} from '@wordpress/i18n';
import domReady from '@wordpress/dom-ready';

const saveDisabledWidgets = async ( widgetsDisabled ) => {
	try {
		const response = await fetch( eElementsManagerConfig.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams( {
				action: 'elementor_elements_manager_save_disabled_widgets',
				nonce: eElementsManagerConfig.nonce,
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
		const response = await fetch( eElementsManagerConfig.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams( {
				action: 'elementor_elements_manager_get_admin_app_data',
				nonce: eElementsManagerConfig.nonce,
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

const getUsageWidgets = async () => {
	try {
		const response = await fetch( eElementsManagerConfig.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams( {
				action: 'elementor_elements_manager_get_usage_widgets',
				nonce: eElementsManagerConfig.nonce,
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
	const [ plugins, setPlugins ] = useState( [] );
	const [ usageWidgets, setUsageWidgets ] = useState( null );
	const [ widgetsDisabled, setWidgetsDisabled ] = useState( [] );
	const [ sortingColumn, setSortingColumn ] = useState( 'widget' );
	const [ sortingDirection, setSortingDirection ] = useState( 'asc' );
	const [ filterByPlugin, setFilterByPlugin ] = useState( '' );

	const getUsageWidget = ( widgetName ) => {
		if ( ! usageWidgets.hasOwnProperty( widgetName ) ) {
			return 0;
		}

		return usageWidgets[ widgetName ];
	}

	const sortedAndFilteredWidgets = useMemo( () => {
		let filteredWidgets = widgets.filter( ( widget ) => {
			return widget.title.toLowerCase().includes( searchKeyword.toLowerCase() );
		} );

		if ( '' !== filterByPlugin ) {
			filteredWidgets = filteredWidgets.filter( ( widget ) => {
				return widget.plugin.toLowerCase() === filterByPlugin.toLowerCase();
			} );
		}

		filteredWidgets.sort( ( a, b ) => {
			let aValue;
			let bValue;

			if ( 'widget' === sortingColumn ) {
				aValue = a.title;
				bValue = b.title;
			}

			if ( 'usage' === sortingColumn ) {
				aValue = getUsageWidget( a.name );
				bValue = getUsageWidget( b.name );
			}

			if ( aValue === bValue ) {
				return 0;
			}

			if ( 'asc' === sortingDirection ) {
				return aValue < bValue ? -1 : 1;
			}

			return aValue > bValue ? -1 : 1;
		} );

		return filteredWidgets;
	}, [ widgets, searchKeyword, sortingColumn, sortingDirection, filterByPlugin	 ] );

	const getSortingIndicatorClasses = ( column ) => {
		if ( sortingColumn !== column ) {
			return '';
		}

		if ( 'asc' === sortingDirection ) {
			return 'sorted asc';
		}

		return 'sorted desc';
	};

	const onSortingClicked = ( column ) => {
		if ( sortingColumn === column ) {
			if ( 'asc' === sortingDirection ) {
				setSortingDirection( 'desc' );
			} else {
				setSortingDirection( 'asc' );
			}
		} else {
			setSortingColumn( column );
			setSortingDirection( 'asc' );
		}
	};

	const onSaveClicked = async () => {
		await saveDisabledWidgets( widgetsDisabled );
		console.log( widgetsDisabled );
	};

	useEffect( () => {
		const onLoading = async () => {
			const appData = await getAdminAppData();

			setWidgetsDisabled( appData.disabled_widgets );
			setWidgets( appData.widgets );

			const pluginsData = appData.plugins.map( ( plugin ) => {
				return {
					label: plugin,
					value: plugin,
				};
			} );

			pluginsData.unshift( {
				label: __( 'All Plugins', 'elementor' ),
				value: '',
			} );

			setPlugins( pluginsData );

			setIsLoading( false );
		};

		onLoading();
	}, [] );

	if ( isLoading ) {
		return (
			<Flex
				justify={'center'}
				style={{
					margin: '100px'
				}}
			>
				<Spinner
					style={{
						height: 'calc(4px * 20)',
						width: 'calc(4px * 20)'
					}}
				/>
			</Flex>
		);
	}

	return (
		<>
			<Panel>
				<PanelBody>
					<Flex
						style={{
							position: 'sticky',
							top: '60px',
							background: '#fff',
							zIndex: 1,
						}}
					>
						<FlexItem>
							<Flex
								align={'center'}
							>
								<SearchControl
									label={ __( 'Search widgets', 'elementor' ) }
									value={ searchKeyword }
									size={ 'compact' }
									style={{ height: '40px' }}
									__nextHasNoMarginBottom={ true }
									onChange={ setSearchKeyword }
								/>
								<SelectControl
									onChange={ setFilterByPlugin }
									size={ '__unstable-large' }
									__nextHasNoMarginBottom={ true }
									options={ plugins }
								/>
								<ButtonGroup>
									<Button
										variant={ 'secondary' }
										style={{ marginInlineEnd: '10px' }}
										isBusy
										onClick={ async () => {

											const data = await getUsageWidgets();
											setUsageWidgets( data );
										} }
									>
										{ __( 'Scan Usage Widgets', 'elementor' ) }
									</Button>
									<Button
										variant={ 'secondary' }
										style={{ marginInlineEnd: '10px' }}
										onClick={ async () => {
											const data = await getUsageWidgets();
											setUsageWidgets( data );
										} }
									>
										{ __( 'Enable All', 'elementor' ) }
									</Button>
									<Button
										variant={ 'secondary' }
										style={{ marginInlineEnd: '10px' }}
										onClick={ async () => {
											const data = await getUsageWidgets();
											setUsageWidgets( data );
										} }
									>
										{ __( 'Deactivate Unused Elements', 'elementor' ) }
									</Button>
								</ButtonGroup>
							</Flex>
						</FlexItem>
						<FlexItem>
							<Button
								variant="primary"
								onClick={ onSaveClicked }
							>
								{ __( 'Save Changes', 'elementor' ) }
							</Button>
						</FlexItem>
					</Flex>

					<PanelRow>

						{ ! sortedAndFilteredWidgets.length ? (
							<>
								{ __( 'No widgets found.', 'elementor' ) }
							</>
							) : (

						<table className={'wp-list-table widefat fixed striped table-view-list'}>
							<thead>
								<tr>
									<th className={`manage-column sortable ${ getSortingIndicatorClasses( 'widget' ) }` }>
										<a onClick={ () => {
											onSortingClicked( 'widget' );
										} }>
											<span>{ __( 'Widget', 'elementor' ) }</span>
											<span className="sorting-indicators">
												<span className="sorting-indicator asc" aria-hidden="true"></span>
												<span className="sorting-indicator desc" aria-hidden="true"></span>
											</span>
										</a>
									</th>
									{ null !== usageWidgets && (
										<th className={`manage-column sortable ${ getSortingIndicatorClasses( 'usage' ) }` }>
											<a onClick={ () => {
												onSortingClicked( 'usage' );
											} }>
												<span>{ __( 'Usage', 'elementor' ) }</span>
												<span className="sorting-indicators">
												<span className="sorting-indicator asc" aria-hidden="true"></span>
												<span className="sorting-indicator desc" aria-hidden="true"></span>
											</span>
											</a>
										</th>
									) }
									<th>{ __( 'Plugin', 'elementor' ) }</th>
									<th>{ __( 'Enabled', 'elementor' ) }</th>
								</tr>
							</thead>
							<tbody>
							{ sortedAndFilteredWidgets.map( ( widget ) => {
								return (
									<tr key={ widget.name }>
										<td>{ widget.title }</td>
										{ null !== usageWidgets && (
											<th>
												{ getUsageWidget( widget.name ) } { __( 'times', 'elementor' ) }
											</th>
										) }
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
						) }
				</PanelRow>

				<PanelRow>
					<Button
						variant="primary"
						onClick={ onSaveClicked }
					>
						{ __( 'Save Changes', 'elementor' ) }
					</Button>
				</PanelRow>
				</PanelBody>
			</Panel>
		</>
	);
}

domReady( () => {
	const htmlOutput = document.getElementById( 'elementor-elements-manager-wrap' );

	if ( htmlOutput ) {
		render( <App />, htmlOutput );
	}
} );

