import {
	useEffect,
	useState,
	useMemo
} from '@wordpress/element';
import {
	__experimentalText as Text,
	__experimentalDivider as Divider,
	__experimentalConfirmDialog as ConfirmDialog,
	Button,
	ToggleControl,
	Spinner,
	SearchControl,
	ButtonGroup,
	Panel,
	PanelBody,
	PanelRow,
	SelectControl,
	FlexItem,
	Flex
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import {
	saveDisabledWidgets,
	getAdminAppData,
	getUsageWidgets,
} from './api';

export const App = () => {
	const [ isLoading, setIsLoading ] = useState( true );
	const [ searchKeyword, setSearchKeyword ] = useState( '' );
	const [ widgets, setWidgets ] = useState( [] );
	const [ plugins, setPlugins ] = useState( [] );
	const [ usageWidgets, setUsageWidgets ] = useState( {
		isLoading: false,
		data: null,
	} );
	const [ widgetsDisabled, setWidgetsDisabled ] = useState( [] );
	const [ sortingColumn, setSortingColumn ] = useState( 'widget' );
	const [ sortingDirection, setSortingDirection ] = useState( 'asc' );
	const [ filterByPlugin, setFilterByPlugin ] = useState( '' );
	const [ changeProgress, setChangeProgress ] = useState( {
		isSaving: false,
		isUnsavedChanges: false,
	} );
	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );

	const getUsageWidget = ( widgetName ) => {
		if ( ! usageWidgets.data || ! usageWidgets.data.hasOwnProperty( widgetName ) ) {
			return 0;
		}

		return usageWidgets.data[ widgetName ];
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
	}, [ widgets, searchKeyword, sortingColumn, sortingDirection, filterByPlugin, usageWidgets ] );

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
		setIsConfirmDialogOpen( false );
		setChangeProgress( { ...changeProgress, isSaving: true } );

		await saveDisabledWidgets( widgetsDisabled );

		setChangeProgress( { ...changeProgress, isSaving: false, isUnsavedChanges: false } );
	};

	const deactivateAllUnusedWidgets = () => {
		const widgetsToDeactivate = widgets.filter( ( widget ) => {
			return ! usageWidgets.data.hasOwnProperty( widget.name ) || widgetsDisabled.includes( widget.name );
		} );

		setWidgetsDisabled( widgetsToDeactivate.map( ( widget ) => {
			return widget.name;
		} ) );
	};

	const enableAllWidgets = () => {
		setWidgetsDisabled( [] );
	};

	const onScanUsageElementsClicked = async () => {
		setUsageWidgets( { ...usageWidgets, isLoading: true } );
		const data = await getUsageWidgets();
		setUsageWidgets( { data, isLoading: false } );
	};

	const UsageTimesColumn = ( { widgetName } ) => {
		if ( null !== usageWidgets.data ) {
			return (
				<>
					{ getUsageWidget( widgetName ) } { __( 'times', 'elementor' ) }
				</>
			);
		}

		if ( usageWidgets.isLoading ) {
			return (
				<Spinner />
			);
		}

		return (
			<Button
				onClick={ onScanUsageElementsClicked }
			>
				Scan to show
			</Button>
		);
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

	useEffect( () => {
		if ( isLoading ) {
			return;
		}

		setChangeProgress( { ...changeProgress, isUnsavedChanges: true } );
	}, [ widgetsDisabled ] );

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
			<Text
				adjustLineHeightForInnerControls="xSmall"
				as="p"
				style={ {
					marginBottom: '20px',
				} }
			>
				The Element Manager is provides users with a streamlined and efficient way to organize, control, and manage elements, offering a hassle-free experience in customizing their websites. <a href="#">Learn More</a>
			</Text>
			<Panel>
				<PanelBody>
					<Flex
						style={ {
							position: 'sticky',
							top: '32px',
							background: 'rgb(255, 255, 255)',
							zIndex: 10,
							padding: '20px 16px',
							boxShadow: 'rgba(0, 0, 0, 0.15) 0 5px 10px 0',
							margin: '-16px -16px 24px',
						} }
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
								<Divider
									margin="2"
									orientation={ 'vertical' }
								/>
								<ButtonGroup>
									<Button
										variant={ 'secondary' }
										style={{ marginInlineEnd: '10px' }}
										disabled={ usageWidgets.isLoading }
										isBusy={ usageWidgets.isLoading }
										onClick={ onScanUsageElementsClicked }
									>
										{ __( 'Scan Usage Elements', 'elementor' ) }
									</Button>
									{ null !== usageWidgets.data && (
										<Button
											variant={ 'secondary' }
											style={{ marginInlineEnd: '10px' }}
											onClick={ deactivateAllUnusedWidgets }
										>
											{ __( 'Deactivate Unused Elements', 'elementor' ) }
										</Button>
									) }
									<Button
										variant={ 'secondary' }
										style={{ marginInlineEnd: '10px' }}
										onClick={ enableAllWidgets }
									>
										{ __( 'Enable All', 'elementor' ) }
									</Button>
								</ButtonGroup>
							</Flex>
						</FlexItem>
						<FlexItem>
							<Button
								variant="primary"
								disabled={ changeProgress.isSaving || ! changeProgress.isUnsavedChanges }
								isBusy={ changeProgress.isSaving }
								onClick={ () => {
									setIsConfirmDialogOpen( true );
								} }
							>
								{ __( 'Save Changes', 'elementor' ) }
							</Button>
						</FlexItem>
					</Flex>

					<PanelRow>
						{ ! sortedAndFilteredWidgets.length ? (
							<>
								{ __( 'No elements found.', 'elementor' ) }
							</>
						) : (

							<table className={'wp-list-table widefat fixed striped table-view-list'}>
								<thead>
								<tr>
									<th className={`manage-column sortable ${ getSortingIndicatorClasses( 'widget' ) }` }>
										<a onClick={ () => {
											onSortingClicked( 'widget' );
										} }>
											<span>{ __( 'Element', 'elementor' ) }</span>
											<span className="sorting-indicators">
												<span className="sorting-indicator asc" aria-hidden="true"></span>
												<span className="sorting-indicator desc" aria-hidden="true"></span>
											</span>
										</a>
									</th>
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
									<th>{ __( 'Plugin', 'elementor' ) }</th>
									<th>{ __( 'Enabled', 'elementor' ) }</th>
								</tr>
								</thead>
								<tbody>
								{ sortedAndFilteredWidgets.map( ( widget ) => {
									return (
										<tr key={ widget.name }>
											<td>{ widget.title }</td>
											<th>
												<UsageTimesColumn
													widgetName={ widget.name }
												/>
											</th>
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
				</PanelBody>
			</Panel>

			<ConfirmDialog
				isOpen={ isConfirmDialogOpen }
				onConfirm={ onSaveClicked }
				onCancel={ () => {
					setIsConfirmDialogOpen( false );
				} }
			>
				Are you sure? <strong>This action cannot be undone!</strong>
			</ConfirmDialog>
		</>
	);
};
