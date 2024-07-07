/* eslint-disable react/prop-types */

import {
	useEffect,
	useState,
	useMemo,
} from '@wordpress/element';
import {
	Button,
	ButtonGroup,
	Flex,
	FlexItem,
	Tooltip,
	Modal,
	Notice,
	Panel,
	PanelBody,
	PanelRow,
	SearchControl,
	SelectControl,
	Snackbar,
	Spinner,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { UpgradeButton } from './upgrade-button';

import {
	getAdminAppData,
	getUsageWidgets,
	markNoticeViewed,
	saveDisabledWidgets,
} from './api';
import {
	RolePermissions,
	EditButtonDisabled,
} from './role-permissions';

export const App = () => {
	const [ isLoading, setIsLoading ] = useState( true );
	const [ searchKeyword, setSearchKeyword ] = useState( '' );
	const [ widgets, setWidgets ] = useState( [] );
	const [ promotionWidgets, setPromotionWidgets ] = useState( [] );
	const [ plugins, setPlugins ] = useState( [] );
	const [ roles, setRoles ] = useState( [] );
	const [ usageWidgets, setUsageWidgets ] = useState( {
		isLoading: false,
		data: null,
	} );
	const [ widgetsDisabled, setWidgetsDisabled ] = useState( [] );
	const [ sortingColumn, setSortingColumn ] = useState( 'widget' );
	const [ sortingDirection, setSortingDirection ] = useState( 'asc' );
	const [ filterByPlugin, setFilterByPlugin ] = useState( '' );
	const [ filterByStatus, setFilterByStatus ] = useState( 'all' );
	const [ changeProgress, setChangeProgress ] = useState( {
		isSaving: false,
		isUnsavedChanges: false,
	} );
	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );
	const [ isSnackbarOpen, setIsSnackbarOpen ] = useState( false );
	const [ noticeData, setNoticeData ] = useState( null );

	const [ widgetsRoleRestrictions, setWidgetsRoleRestrictions ] = useState( null );
	const [ promotionData, setPromotionData ] = useState( [] );
	const { manager_permissions: managerPermissions, element_manager: elementManager } = promotionData;

	const getWidgetUsage = ( widgetName ) => {
		if ( ! usageWidgets.data || ! usageWidgets.data.hasOwnProperty( widgetName ) ) {
			return 0;
		}

		return usageWidgets.data[ widgetName ];
	};

	const sortedAndFilteredWidgets = useMemo( () => {
		let filteredWidgets = widgets.filter( ( widget ) => {
			return widget.title.toLowerCase().includes( searchKeyword.toLowerCase() );
		} );

		if ( '' !== filterByPlugin ) {
			filteredWidgets = filteredWidgets.filter( ( widget ) => {
				return widget.plugin.toLowerCase() === filterByPlugin.toLowerCase();
			} );
		}

		if ( 'all' !== filterByStatus ) {
			filteredWidgets = filteredWidgets.filter( ( widget ) => {
				if ( 'active' === filterByStatus ) {
					return ! widgetsDisabled.includes( widget.name );
				}

				return widgetsDisabled.includes( widget.name );
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
	}, [ widgets, searchKeyword, sortingColumn, sortingDirection, filterByPlugin, usageWidgets, filterByStatus, widgetsDisabled ] );

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

		await saveDisabledWidgets( widgetsDisabled, widgetsRoleRestrictions );

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

			setNoticeData( appData.notice_data );
			setWidgetsDisabled( appData.disabled_elements );
			setWidgets( appData.widgets );
			setPromotionWidgets( appData.promotion_widgets );
			setPromotionData( appData.promotion_data );

			if ( appData.additional_data?.roles ) {
				setRoles( appData.additional_data.roles );
			}

			if ( appData.additional_data?.role_restrictions ) {
				setWidgetsRoleRestrictions( appData.additional_data.role_restrictions );
			}

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
	}, [ widgetsDisabled, widgetsRoleRestrictions ] );

	useEffect( () => {
		const handleBeforeUnload = ( event ) => {
			event.preventDefault();
			event.returnValue = '';
		};

		if ( changeProgress.isUnsavedChanges ) {
			window.addEventListener( 'beforeunload', handleBeforeUnload );
		} else {
			window.removeEventListener( 'beforeunload', handleBeforeUnload );
		}

		return () => {
			window.removeEventListener( 'beforeunload', handleBeforeUnload );
		};
	}, [ changeProgress.isUnsavedChanges ] );

	if ( isLoading ) {
		return (
			<Flex
				justify={ 'center' }
				style={ {
					margin: '100px',
				} }
			>
				<Spinner
					style={ {
						height: 'calc(4px * 20)',
						width: 'calc(4px * 20)',
					} }
				/>
			</Flex>
		);
	}

	return (
		<>
			<p
				style={ {
					marginBottom: '20px',
					maxWidth: '800px',
				} }
			>
				{ __( 'Here\'s where you can fine-tune Elementor to your workflow. Disable elements you don\'t use for a cleaner interface, more focused creative experience, and improved performance.', 'elementor' ) }
				{ ' ' }
				<a href="https://go.elementor.com/wp-dash-element-manager/" rel={ 'noreferrer' } target={ '_blank' }>
					{ __( 'Learn More', 'elementor' ) }
				</a>
			</p>

			{ ! noticeData.is_viewed && (
				<p>
					<Notice
						onRemove={ () => {
							markNoticeViewed( noticeData.notice_id );
							setNoticeData( { ...noticeData, is_viewed: true } );
						} }
						status="warning"
					>
						<strong>{ __( 'Before you continue:', 'elementor' ) }</strong> { __( 'Deactivating widgets here will remove them from both the Elementor Editor and your website, which can cause changes to your overall layout, design and what visitors see.', 'elementor' ) }
					</Notice>
				</p>
			) }
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
								align={ 'center' }
							>
								<SearchControl
									label={ __( 'Search widgets', 'elementor' ) }
									value={ searchKeyword }
									size={ 'compact' }
									style={ {
										height: '40px',
										border: '1px solid rgba(30, 30, 30, 0.5)',
										background: 'transparent',
									} }
									__nextHasNoMarginBottom={ true }
									onChange={ setSearchKeyword }
								/>
								<FlexItem
									style={ {
										maxWidth: '130px',
									} }
								>
									<SelectControl
										onChange={ setFilterByPlugin }
										size={ '__unstable-large' }
										__nextHasNoMarginBottom={ true }
										options={ plugins }
									/>
								</FlexItem>
								<FlexItem
									style={ {
										maxWidth: '130px',
									} }
								>
									<SelectControl
										onChange={ setFilterByStatus }
										size={ '__unstable-large' }
										__nextHasNoMarginBottom={ true }
										options={ [
											{
												label: __( 'All Statuses', 'elementor' ),
												value: 'all',
											},
											{
												label: __( 'Active', 'elementor' ),
												value: 'active',
											},
											{
												label: __( 'Inactive', 'elementor' ),
												value: 'inactive',
											},
										] }
									/>
								</FlexItem>
								<hr
									style={ {
										height: '30px',
										margin: '0 5px',
										borderWidth: '0 1px 0 0',
										borderStyle: 'solid',
										borderColor: 'rgba(30, 30, 30, 0.5)',
									} }
								/>
								<ButtonGroup>
									<Button
										variant={ 'secondary' }
										style={ { marginInlineEnd: '10px' } }
										disabled={ usageWidgets.isLoading }
										isBusy={ usageWidgets.isLoading }
										onClick={ onScanUsageElementsClicked }
									>
										{ __( 'Scan Element Usage', 'elementor' ) }
									</Button>
									<Button
										variant={ 'secondary' }
										style={ { marginInlineEnd: '10px' } }
										onClick={ deactivateAllUnusedWidgets }
										disabled={ null === usageWidgets.data }
									>
										{ __( 'Deactivate Unused Elements', 'elementor' ) }
									</Button>
									<Button
										variant={ 'secondary' }
										disabled={ ! widgetsDisabled.length }
										style={ { marginInlineEnd: '10px' } }
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

							<table className={ 'wp-list-table widefat fixed striped table-view-list' }>
								<thead>
									<tr>
										<th className={ `manage-column sortable ${ getSortingIndicatorClasses( 'widget' ) }` }>
											<Button
												href={ '#' }
												onClick={ ( event ) => {
													event.preventDefault();
													onSortingClicked( 'widget' );
												} }
											>
												<span>{ __( 'Element', 'elementor' ) }</span>
												<span className="sorting-indicators">
													<span className="sorting-indicator asc" aria-hidden="true"></span>
													<span className="sorting-indicator desc" aria-hidden="true"></span>
												</span>
											</Button>
										</th>
										<th>{ __( 'Status', 'elementor' ) }</th>
										<th className={ `manage-column sortable ${ getSortingIndicatorClasses( 'usage' ) }` }>
											<Button
												href={ '#' }
												onClick={ ( event ) => {
													event.preventDefault();
													onSortingClicked( 'usage' );
												} }
											>
												<span>{ __( 'Usage', 'elementor' ) }</span>
												<span className="sorting-indicators">
													<span className="sorting-indicator asc" aria-hidden="true"></span>
													<span className="sorting-indicator desc" aria-hidden="true"></span>
												</span>
											</Button>
										</th>
										<th>{ __( 'Plugin', 'elementor' ) }</th>
										<th>
											<Flex
												justify={ 'flex-start' }
												gap={ 0 }
											>
												<FlexItem>
													{ __( 'Permission', 'elementor' ) }
												</FlexItem>
												<FlexItem>
													<Tooltip
														placement={ 'top' }
														delay={ 100 }
														text={ __( 'Choose which users will have access to each widget.', 'elementor' ) }
													>
														<Button
															icon={ 'info-outline' }
															iconSize={ 16 }
														/>
													</Tooltip>
												</FlexItem>
												{ null === widgetsRoleRestrictions && (
													<FlexItem
														style={ {
															marginInlineStart: '10px',
														} }
													>
														<UpgradeButton
															href={
																promotionWidgets.length
																	? managerPermissions.pro.url
																	: managerPermissions.advanced.url
															}
															size={ 'small' }
															text={
																promotionWidgets.length
																	? managerPermissions.pro.text
																	: managerPermissions.advanced.text
															}
														/>
													</FlexItem>
												) }
											</Flex>
										</th>
									</tr>
								</thead>
								<tbody>
									{ sortedAndFilteredWidgets.map( ( widget ) => {
										return (
											<tr key={ widget.name } data-key-id={ widget.name }>
												<td>
													<i
														style={ {
															marginInlineEnd: '5px',
															marginInlineStart: '0',
															display: 'inline-block',
														} }
														className={ `${ widget.icon }` }
													></i> { widget.title }
												</td>
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
												<td>
													<UsageTimesColumn
														widgetName={ widget.name }
													/>
												</td>
												<td>{ widget.plugin }</td>
												<td>
													{ null !== widgetsRoleRestrictions && ! widgetsDisabled.includes( widget.name ) ? (
														<RolePermissions
															widgetName={ widget.name }
															roles={ roles }
															widgetsRoleRestrictions={ widgetsRoleRestrictions }
															setWidgetsRoleRestrictions={ setWidgetsRoleRestrictions }
														/>
													) : (
														<EditButtonDisabled />
													) }
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
									style={ {
										marginTop: '40px',
										marginBottom: '20px',
									} }
								>
									<FlexItem>
										<h3>
											{ __( 'Elementor Pro Elements', 'elementor' ) }
										</h3>
										<p>
											{ __( 'Unleash the full power of Elementor\'s features and web creation tools.', 'elementor' ) }
										</p>
									</FlexItem>
									<FlexItem>
										<UpgradeButton
											href={ elementManager.url }
											text={ elementManager.text }
										/>
									</FlexItem>
								</Flex>
							</PanelRow>
							<PanelRow>
								<table className={ 'wp-list-table widefat fixed striped table-view-list' }>
									<thead>
										<tr>
											<th className={ `manage-column` }>
												<span>{ __( 'Element', 'elementor' ) }</span>
											</th>
											<th>{ __( 'Status', 'elementor' ) }</th>
											<th>{ __( 'Usage', 'elementor' ) }</th>
											<th>{ __( 'Plugin', 'elementor' ) }</th>
											<th>
												<Flex
													justify={ 'flex-start' }
												>
													<FlexItem>
														{ __( 'Permission', 'elementor' ) }
													</FlexItem>
													<FlexItem>
														<Tooltip
															placement={ 'top' }
															delay={ 100 }
															text={ __( 'Choose which role will have access to a specific widget.', 'elementor' ) }
														>
															<Button
																icon={ 'info-outline' }
															/>
														</Tooltip>
													</FlexItem>
												</Flex>
											</th>
										</tr>
									</thead>
									<tbody>
										{ promotionWidgets.map( ( widget ) => {
											return (
												<tr key={ widget.name }>
													<td>
														<i
															style={ {
																marginInlineEnd: '5px',
															} }
															className={ `${ widget.icon }` }
														></i> { widget.title }
													</td>
													<td>
														<ToggleControl
															__nextHasNoMarginBottom={ true }
															checked={ false }
															disabled={ true }
														/>
													</td>
													<td></td>
													<td>{ __( 'Elementor Pro', 'elementor' ) }</td>
													<td>
														<EditButtonDisabled />
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

			{ isConfirmDialogOpen && (
				<Modal
					title={ __( 'Sure you want to save these changes?', 'elementor' ) }
					size={ 'small' }
					isDismissible={ false }
					onRequestClose={ () => {
						setIsConfirmDialogOpen( false );
					} }
				>
					<p
						style={ {
							maxWidth: '400px',
							marginBlockEnd: '30px',
							marginBlockStart: '0',
						} }
					>
						{ __( 'Turning widgets off will hide them from the editor panel, and can potentially affect your layout or front-end.', 'elementor' ) }
						<span
							style={ {
								display: 'block',
								marginTop: '20px',
							} }
						>
							{ __( 'If you’re adding widgets back in, enjoy them!', 'elementor' ) }
						</span>
					</p>
					<ButtonGroup
						style={ {
							display: 'flex',
							justifyContent: 'flex-end',
							gap: '30px',
						} }
					>
						<Button
							variant={ 'link' }
							onClick={ () => {
								setIsConfirmDialogOpen( false );
							} }
						>
							{ __( 'Cancel', 'elementor' ) }
						</Button>
						<Button
							variant={ 'primary' }
							onClick={ onSaveClicked }
						>
							{ __( 'Save', 'elementor' ) }
						</Button>
					</ButtonGroup>
				</Modal>
			) }

			{ /* TODO: Use notices API */ }
			<div style={ {
				position: 'fixed',
				bottom: '40px',
				left: '50%',
				transform: 'translateX(-50%)',
				display: isSnackbarOpen ? 'block' : 'none',
			} }>
				<Snackbar
					isDismissible
					status={ 'success' }
					onRemove={ () => setIsSnackbarOpen( false ) }
				>
					{ __( 'We saved your changes.', 'elementor' ) }
				</Snackbar>
			</div>
		</>
	);
};
