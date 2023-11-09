import {
	useEffect,
	useState,
	useMemo
} from '@wordpress/element';
import {
	__experimentalText as Text,
	__experimentalDivider as Divider,
	__experimentalHeading as Heading,
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
	Flex,
	Snackbar,
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
	const [ promotionWidgets, setPromotionWidgets ] = useState( [] );
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
	const [ isSnackbarOpen, setIsSnackbarOpen ] = useState( false );

	const getWidgetUsage = ( widgetName ) => {
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
				aValue = getWidgetUsage( a.name );
				bValue = getWidgetUsage( b.name );
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

		setIsSnackbarOpen( true );
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
		setSortingColumn( 'usage' );
		setSortingDirection( 'desc' );
	};

	const UsageTimesColumn = ( { widgetName } ) => {
		if ( null !== usageWidgets.data ) {
			return (
				<>
					{ getWidgetUsage( widgetName ) } { __( 'times', 'elementor' ) }
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
				size={ 'small' }
				variant={ 'secondary' }
			>
				{ __( 'Show', 'elementor' ) }
			</Button>
		);
	};

	useEffect( () => {
		const onLoading = async () => {
			const appData = await getAdminAppData();

			setWidgetsDisabled( appData.disabled_elements );
			setWidgets( appData.widgets );
			setPromotionWidgets( appData.promotion_widgets );

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
					maxWidth: '800px',
				} }
			>
				{ __( 'Here\'s where you can fine-tune Elementor to your workflow. Disable elements you don\'t use for a cleaner interface, more focused creative experience, and improved performance', 'elementor' ) }
				{ ' ' }
				<a href="https://go.elementor.com/wp-dash-element-manager/" target={ '_blank' }>
					{ __( 'Learn More', 'elementor' ) }
				</a>
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
									style={{
										height: '40px',
										border: '1px solid rgba(30, 30, 30, 0.5)',
										background: 'transparent',
									}}
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
									style={{
										height: '30px',
										borderColor: 'rgba(30, 30, 30, 0.5)',
									}}
								/>
								<ButtonGroup>
									<Button
										variant={ 'secondary' }
										style={{ marginInlineEnd: '10px' }}
										disabled={ usageWidgets.isLoading }
										isBusy={ usageWidgets.isLoading }
										onClick={ onScanUsageElementsClicked }
									>
										{ __( 'Scan Element Usage', 'elementor' ) }
									</Button>
									<Button
										variant={ 'secondary' }
										style={{ marginInlineEnd: '10px' }}
										onClick={ deactivateAllUnusedWidgets }
										disabled={ null === usageWidgets.data }
									>
										{ __( 'Deactivate Unused Elements', 'elementor' ) }
									</Button>
									<Button
										variant={ 'secondary' }
										disabled={ ! widgetsDisabled.length }
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
									<th>{ __( 'Status', 'elementor' ) }</th>
								</tr>
								</thead>
								<tbody>
								{ sortedAndFilteredWidgets.map( ( widget ) => {
									return (
										<tr key={ widget.name }>
											<td>{ widget.title }</td>
											<td>
												<UsageTimesColumn
													widgetName={ widget.name }
												/>
											</td>
											<td>{ widget.plugin }</td>
											<td>
												<ToggleControl
													checked={ ! widgetsDisabled.includes( widget.name ) }
													__nextHasNoMarginBottom={ true }
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

					{ promotionWidgets.length > 0 && (
						<>
							<PanelRow>
								<Flex
									style={{
										marginTop: '40px',
										marginBottom: '20px',
								}}>
									<FlexItem>
										<Heading
											level={ 3 }
										>
											{ __( 'Elementor Pro Elements', 'elementor' ) }
										</Heading>
										<Text>
											{ __( 'Unleash the full power of Elementor\'s features and web creation tools.', 'elementor' ) }
										</Text>
									</FlexItem>
									<FlexItem>
										<Button
											variant="primary"
											href="https://go.elementor.com/go-pro-element-manager/"
											target="_blank"
											style={{
												background: 'var(--e-a-btn-bg-accent, #93003f)',
											}}
										>
											{ __( 'Upgrade Now', 'elementor' ) }
										</Button>
									</FlexItem>
								</Flex>
							</PanelRow>
							<PanelRow>
							<table className={'wp-list-table widefat fixed striped table-view-list'}>
								<thead>
								<tr>
									<th className={`manage-column` }>
										<span>{ __( 'Element', 'elementor' ) }</span>
									</th>
									<th>{ __( 'Usage', 'elementor' ) }</th>
									<th>{ __( 'Plugin', 'elementor' ) }</th>
									<th>{ __( 'Status', 'elementor' ) }</th>
								</tr>
								</thead>
								<tbody>
								{ promotionWidgets.map( ( widget ) => {
									return (
										<tr key={ widget.name }>
											<td>{ widget.title }</td>
											<td>

											</td>
											<td>{ __( 'Elementor Pro', 'elementor' ) }</td>
											<td>
												<ToggleControl
													__nextHasNoMarginBottom={ true }
													checked={ false }
													disabled={ true }
												/>
											</td>
										</tr>
									);
								} ) }
								</tbody>
							</table>
						</PanelRow>
						</>
					) }
				</PanelBody>
			</Panel>

			<ConfirmDialog
				isOpen={ isConfirmDialogOpen }
				onConfirm={ onSaveClicked }
				cancelButtonText={ __( 'Cancel', 'elementor' ) }
				confirmButtonText={ __( 'Save', 'elementor' ) }
				onCancel={ () => {
					setIsConfirmDialogOpen( false );
				} }
			>
				<Heading
					level={ 4 }
					style={{
						marginBottom: '20px',
					}}
				>
					{ __( 'Sure you want to save these changes?', 'elementor' ) }
				</Heading>
				<Text
					as={ 'p' }
					lineHeight={ 1.5 }
					style={{
						maxWidth: '400px',
					}}
				>
					{ __( 'Turning off widgets will hide them from the panel in the editor and from your website, potentially changing your layout or front-end appearance.', 'elementor' ) }
				</Text>
			</ConfirmDialog>

			{ /* TODO: Use notices API */ }
			<div style={{
				position: 'fixed',
				bottom: '40px',
				left: '50%',
				transform: 'translateX(-50%)',
				display: isSnackbarOpen ? 'block' : 'none',
			}}>
				<Snackbar
					isDismissible
					status={ 'success' }
					onRemove={ () => { setIsSnackbarOpen( false ) } }
				>
					{ __( 'We saved your changes.', 'elementor' ) }
				</Snackbar>
			</div>
		</>
	);
};
