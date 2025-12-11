/* eslint-disable react/prop-types */

import {
	useEffect,
	useState,
	useMemo,
} from '@wordpress/element';
import {
	Button,
	Stack,
	Box,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Alert,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Snackbar,
	CircularProgress,
	Switch,
	IconButton,
	Typography,
	Divider,
	DirectionProvider,
	ThemeProvider,
} from '@elementor/ui';
import { HelpIcon } from '@elementor/icons';
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

const AppModernContent = () => {
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
	const [ widgetsDisabledSet, setWidgetsDisabledSet ] = useState( () => new Set() );
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

	const isWidgetDisabled = ( widgetName ) => widgetsDisabledSet.has( widgetName );

	const toggleWidgetDisabled = ( widgetName, enabled ) => {
		setWidgetsDisabledSet( ( prev ) => {
			const next = new Set( prev );
			if ( enabled ) {
				next.delete( widgetName );
			} else {
				next.add( widgetName );
			}
			return next;
		} );
	};

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
					return ! widgetsDisabledSet.has( widget.name );
				}

				return widgetsDisabledSet.has( widget.name );
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
	}, [ widgets, searchKeyword, sortingColumn, sortingDirection, filterByPlugin, usageWidgets, filterByStatus, widgetsDisabledSet ] );

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

		await saveDisabledWidgets( Array.from( widgetsDisabledSet ), widgetsRoleRestrictions );

		setChangeProgress( { ...changeProgress, isSaving: false, isUnsavedChanges: false } );

		setIsSnackbarOpen( true );
	};

	const deactivateAllUnusedWidgets = () => {
		const widgetsToDeactivate = widgets.filter( ( widget ) => {
			return ! usageWidgets.data.hasOwnProperty( widget.name ) || widgetsDisabledSet.has( widget.name );
		} );

		setWidgetsDisabledSet( new Set( widgetsToDeactivate.map( ( widget ) => widget.name ) ) );
	};

	const enableAllWidgets = () => {
		setWidgetsDisabledSet( new Set() );
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
				<CircularProgress color="secondary" size={ 20 } />
			);
		}

		return (
			<Button
				onClick={ onScanUsageElementsClicked }
				size="small"
				variant="outlined"
				color="secondary"
				className="e-id-elementor-element-manager-button-show-usage"
				sx={ {
					minWidth: '45px',
					height: '26px',
				} }
			>
				{ __( 'Show', 'elementor' ) }
			</Button>
		);
	};

	useEffect( () => {
		const onLoading = async () => {
			const appData = await getAdminAppData();

			setNoticeData( appData.notice_data );
			setWidgetsDisabledSet( new Set( appData.disabled_elements ) );
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
	}, [ widgetsDisabledSet, widgetsRoleRestrictions ] );

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
			<Stack
				justifyContent="center"
				sx={ {
					margin: '100px',
				} }
			>
				<CircularProgress
					size={ 80 }
				/>
			</Stack>
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
				<Box sx={ { mb: 2 } }>
					<Alert
						severity="warning"
						onClose={ () => {
							markNoticeViewed( noticeData.notice_id, noticeData.nonce );
							setNoticeData( { ...noticeData, is_viewed: true } );
						} }
					>
						<Typography component="strong" variant="body2" sx={ { fontWeight: 700 } }>
							{ __( 'Before you continue:', 'elementor' ) }
						</Typography>
						{ ' ' }
						{ __( 'Deactivating widgets here will remove them from both the Elementor Editor and your website, which can cause changes to your overall layout, design and what visitors see.', 'elementor' ) }
					</Alert>
				</Box>
			) }
			<Box>
				<Box>
					<Stack
						direction="row"
						alignItems="center"
						justifyContent="space-between"
						sx={ {
							position: 'sticky',
							top: '32px',
							backgroundColor: 'var(--e-one-palette-background-default)',
							zIndex: 10,
							padding: '20px 16px',
							boxShadow: 'rgba(0, 0, 0, 0.15) 0 5px 10px 0',
							margin: '-16px -16px 24px',
						} }
					>
						<Box>
							<Stack
								direction="row"
								alignItems="center"
								gap={ 2 }
							>
								<TextField
									label={ __( 'Search', 'elementor' ) }
									color="secondary"
									value={ searchKeyword }
									size="small"
									placeholder={ __( 'Search', 'elementor' ) }
									onChange={ ( e ) => setSearchKeyword( e.target.value ) }
									sx={ {
										minWidth: '113px',
									} }
								/>
								<FormControl
									fullWidth
									size="small"
									sx={ {
										maxWidth: '130px',
										minWidth: '130px',
									} }
									color="secondary"
								>
									<InputLabel>{ __( 'Plugin', 'elementor' ) }</InputLabel>
									<Select
										value={ filterByPlugin }
										onChange={ ( event ) => setFilterByPlugin( event.target.value ) }
										name="elementor-element-manager-select-filter-by-plugin"
									>
										{ plugins.map( ( plugin ) => (
											<MenuItem key={ plugin.value } value={ plugin.value }>
												{ plugin.label }
											</MenuItem>
										) ) }
									</Select>
								</FormControl>
								<FormControl
									fullWidth
									size="small"
									sx={ {
										maxWidth: '130px',
										minWidth: '130px',
									} }
									color="secondary"
								>
									<InputLabel>{ __( 'Status', 'elementor' ) }</InputLabel>
									<Select
										value={ filterByStatus }
										onChange={ ( event ) => setFilterByStatus( event.target.value ) }
										name="elementor-element-manager-select-filter-by-status"
									>
										<MenuItem value="all">{ __( 'All Statuses', 'elementor' ) }</MenuItem>
										<MenuItem value="active">{ __( 'Active', 'elementor' ) }</MenuItem>
										<MenuItem value="inactive">{ __( 'Inactive', 'elementor' ) }</MenuItem>
									</Select>
								</FormControl>
								<Divider
									orientation="vertical"
									flexItem
									sx={ {
										height: '30px',
										margin: '0 5px',
									} }
								/>
								<Stack direction="row" gap={ 1 }>
									<Button
										variant="outlined"
										color="secondary"
										disabled={ usageWidgets.isLoading }
										onClick={ onScanUsageElementsClicked }
										className="e-id-elementor-element-manager-button-scan-element-usage"
										loading={ usageWidgets.isLoading }
									>
										{ __( 'Scan Element Usage', 'elementor' ) }
									</Button>
									<Button
										variant="outlined"
										color="secondary"
										onClick={ deactivateAllUnusedWidgets }
										disabled={ null === usageWidgets.data }
										className="e-id-elementor-element-manager-button-deactivate-unused-elements"
									>
										{ __( 'Deactivate Unused Elements', 'elementor' ) }
									</Button>
									<Button
										variant="outlined"
										color="secondary"
										disabled={ 0 === widgetsDisabledSet.size }
										onClick={ enableAllWidgets }
										className="e-id-elementor-element-manager-button-enable-all"
									>
										{ __( 'Enable All', 'elementor' ) }
									</Button>
								</Stack>
							</Stack>
						</Box>
						<Box>
							<Button
								variant="contained"
								disabled={ changeProgress.isSaving || ! changeProgress.isUnsavedChanges }
								onClick={ () => {
									setIsConfirmDialogOpen( true );
								} }
								className="e-id-elementor-element-manager-button-save-changes"
								loading={ changeProgress.isSaving }
							>
								{ __( 'Save Changes', 'elementor' ) }
							</Button>
						</Box>
					</Stack>

					<Box>
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
												component="a"
												href="#"
												onClick={ ( event ) => {
													event.preventDefault();
													onSortingClicked( 'widget' );
												} }
												className="e-id-elementor-element-manager-button-sort-by-element"
												variant="text"
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
												component="a"
												href="#"
												onClick={ ( event ) => {
													event.preventDefault();
													onSortingClicked( 'usage' );
												} }
												className="e-id-elementor-element-manager-button-sort-by-usage"
												variant="text"
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
											<Stack
												direction="row"
												justifyContent="flex-start"
												alignItems="center"
												gap={ 1 }
											>
												<Box>
													{ __( 'Permission', 'elementor' ) }
												</Box>
												<Box>
													<Tooltip
														placement="top"
														title={ __( 'Choose which users will have access to each widget.', 'elementor' ) }
													>
														<IconButton size="small">
															<HelpIcon fontSize="small" />
														</IconButton>
													</Tooltip>
												</Box>
												{ null === widgetsRoleRestrictions && (
													<Box sx={ { marginInlineStart: '10px' } }>
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
															className={ [ 'e-id-elementor-element-manager-button-upgrade-permissions', 'go-pro' ].join( ' ' ) }
														/>
													</Box>
												) }
											</Stack>
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
													<Switch
														color="secondary"
														checked={ ! isWidgetDisabled( widget.name ) }
														onChange={ ( event, checked ) => toggleWidgetDisabled( widget.name, checked ) }
														size="small"
														className={ `e-id-elementor-element-manager-toggle-${ widget.name }` }
													/>
												</td>
												<td>
													<UsageTimesColumn
														widgetName={ widget.name }
													/>
												</td>
												<td>{ widget.plugin }</td>
												<td>
													{ null !== widgetsRoleRestrictions && ! isWidgetDisabled( widget.name ) ? (
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
					</Box>

					{ promotionWidgets.length > 0 && (
						<>
							<Box sx={ { mt: 5, mb: 2.5 } }>
								<Stack
									direction="row"
									justifyContent="space-between"
									alignItems="center"
								>
									<Box>
										<Typography variant="h6" component="h3">
											{ __( 'Elementor Pro Elements', 'elementor' ) }
										</Typography>
										<Typography variant="body2" component="p">
											{ __( 'Unleash the full power of Elementor\'s features and web creation tools.', 'elementor' ) }
										</Typography>
									</Box>
									<Box>
										<UpgradeButton
											href={ elementManager.url }
											text={ elementManager.text }
											className="e-id-elementor-element-manager-button-upgrade-pro-elements"
										/>
									</Box>
								</Stack>
							</Box>
							<Box>
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
												<Stack
													direction="row"
													justifyContent="flex-start"
													alignItems="center"
													gap={ 1 }
												>
													<Box>
														{ __( 'Permission', 'elementor' ) }
													</Box>
													<Box>
														<Tooltip
															placement="top"
															title={ __( 'Choose which role will have access to a specific widget.', 'elementor' ) }
														>
															<IconButton size="small">
																<HelpIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													</Box>
												</Stack>
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
														<Switch
															checked={ false }
															disabled={ true }
															size="small"
															className={ `e-id-elementor-element-manager-toggle-${ widget.name }` }
														/>
													</td>
													<td></td>
													<td>{ __( 'Elementor Pro', 'elementor' ) }</td>
													<td>
														<EditButtonDisabled widgetName={ widget.name } />
													</td>
												</tr>
											);
										} ) }
									</tbody>
								</table>
							</Box>
						</>
					) }
				</Box>
			</Box>

			<Dialog
				open={ isConfirmDialogOpen }
				onClose={ () => {
					setIsConfirmDialogOpen( false );
				} }
				maxWidth="sm"
			>
				<DialogTitle>
					{ __( 'Sure you want to save these changes?', 'elementor' ) }
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{ __( 'Turning widgets off will hide them from the editor panel, and can potentially affect your layout or front-end.', 'elementor' ) }
						<Box component="span" sx={ { display: 'block', mt: 2.5 } }>
							{ __( 'If you’re adding widgets back in, enjoy them!', 'elementor' ) }
						</Box>
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Stack direction="row" gap={ 2 } justifyContent="flex-end">
						<Button
							variant="outlined"
							color="secondary"
							onClick={ () => {
								setIsConfirmDialogOpen( false );
							} }
							className="e-id-elementor-element-manager-modal-button-cancel"
						>
							{ __( 'Cancel', 'elementor' ) }
						</Button>
						<Button
							variant="contained"
							onClick={ onSaveClicked }
							className="e-id-elementor-element-manager-modal-button-save"
						>
							{ __( 'Save', 'elementor' ) }
						</Button>
					</Stack>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={ isSnackbarOpen }
				autoHideDuration={ 6000 }
				onClose={ () => setIsSnackbarOpen( false ) }
				message={ __( 'We saved your changes.', 'elementor' ) }
				anchorOrigin={ {
					vertical: 'bottom',
					horizontal: 'center',
				} }
			/>
		</>
	);
};

export const AppModern = () => {
	const isRTL = typeof elementorCommon !== 'undefined' && elementorCommon.config?.isRTL
		? elementorCommon.config.isRTL
		: 'rtl' === document.documentElement.dir || document.body.classList.contains( 'rtl' );

	return (
		<DirectionProvider rtl={ isRTL }>
			<ThemeProvider colorScheme="light">
				<AppModernContent />
			</ThemeProvider>
		</DirectionProvider>
	);
};
