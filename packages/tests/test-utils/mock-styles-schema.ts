import { type PropsSchema } from '@elementor/editor-props';

import { createMockSingleSizeFilterPropType } from './create-mock-filter-schema';

export const mockStylesSchema = {
	'font-size': {
		kind: 'object',
		key: 'size',
		default: null,
		meta: {},
		settings: {},
		shape: {
			size: {
				kind: 'plain',
				key: 'number',
				default: null,
				meta: {},
				settings: {
					required: true,
				},
			},
			unit: {
				kind: 'plain',
				key: 'string',
				default: null,
				meta: {},
				settings: {
					enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
					required: true,
				},
			},
		},
	},
	'font-style': {
		kind: 'plain',
		key: 'string',
		default: null,
		meta: {},
		settings: {},
	},
	'text-stroke': {
		kind: 'object',
		key: 'stroke',
		default: null,
		meta: {},
		settings: {},
		shape: {
			color: {
				kind: 'plain',
				key: 'color',
				default: null,
				meta: {},
				settings: {},
			},
			width: {
				kind: 'object',
				key: 'size',
				default: null,
				meta: {},
				settings: {},
				shape: {
					size: {
						kind: 'plain',
						key: 'number',
						default: null,
						meta: {},
						settings: {
							required: true,
						},
					},
					unit: {
						kind: 'plain',
						key: 'string',
						default: null,
						meta: {},
						settings: {
							enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
							required: true,
						},
					},
				},
			},
		},
	},
	margin: {
		kind: 'object',
		key: 'dimensions',
		default: null,
		meta: {},
		settings: {},
		shape: {
			isLinked: {
				kind: 'plain',
				key: 'boolean',
				default: null,
				meta: {},
				settings: {},
			},
			'block-start': {
				kind: 'union',
				default: null,
				meta: {},
				settings: {},
				prop_types: {
					size: {
						kind: 'object',
						key: 'size',
						default: null,
						meta: {},
						settings: {},
						shape: {
							size: {
								kind: 'plain',
								key: 'number',
								default: null,
								meta: {},
								settings: {
									required: true,
								},
							},
							unit: {
								kind: 'plain',
								key: 'string',
								default: null,
								meta: {},
								settings: {
									enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'auto', 'vmin', 'vmax' ],
									required: true,
								},
							},
						},
					},
					string: {
						kind: 'plain',
						key: 'string',
						default: null,
						meta: {},
						settings: {
							enum: [ 'auto' ],
						},
					},
				},
			},
			'block-end': {
				kind: 'union',
				default: null,
				meta: {},
				settings: {},
				prop_types: {
					size: {
						kind: 'object',
						key: 'size',
						default: null,
						meta: {},
						settings: {},
						shape: {
							size: {
								kind: 'plain',
								key: 'number',
								default: null,
								meta: {},
								settings: {
									required: true,
								},
							},
							unit: {
								kind: 'plain',
								key: 'string',
								default: null,
								meta: {},
								settings: {
									enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'auto', 'vmin', 'vmax' ],
									required: true,
								},
							},
						},
					},
					string: {
						kind: 'plain',
						key: 'string',
						default: null,
						meta: {},
						settings: {
							enum: [ 'auto' ],
						},
					},
				},
			},
			'inline-start': {
				kind: 'union',
				default: null,
				meta: {},
				settings: {},
				prop_types: {
					size: {
						kind: 'object',
						key: 'size',
						default: null,
						meta: {},
						settings: {},
						shape: {
							size: {
								kind: 'plain',
								key: 'number',
								default: null,
								meta: {},
								settings: {
									required: true,
								},
							},
							unit: {
								kind: 'plain',
								key: 'string',
								default: null,
								meta: {},
								settings: {
									enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'auto', 'vmin', 'vmax' ],
									required: true,
								},
							},
						},
					},
					string: {
						kind: 'plain',
						key: 'string',
						default: null,
						meta: {},
						settings: {
							enum: [ 'auto' ],
						},
					},
				},
			},
			'inline-end': {
				kind: 'union',
				default: null,
				meta: {},
				settings: {},
				prop_types: {
					size: {
						kind: 'object',
						key: 'size',
						default: null,
						meta: {},
						settings: {},
						shape: {
							size: {
								kind: 'plain',
								key: 'number',
								default: null,
								meta: {},
								settings: {
									required: true,
								},
							},
							unit: {
								kind: 'plain',
								key: 'string',
								default: null,
								meta: {},
								settings: {
									enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'auto', 'vmin', 'vmax' ],
									required: true,
								},
							},
						},
					},
					string: {
						kind: 'plain',
						key: 'string',
						default: null,
						meta: {},
						settings: {
							enum: [ 'auto' ],
						},
					},
				},
			},
		},
	},
	'border-radius': {
		kind: 'union',
		default: null,
		meta: {},
		settings: {},
		prop_types: {
			size: {
				kind: 'object',
				key: 'size',
				default: null,
				meta: {},
				settings: {},
				shape: {
					size: {
						kind: 'plain',
						key: 'number',
						default: null,
						meta: {},
						settings: {
							required: true,
						},
					},
					unit: {
						kind: 'plain',
						key: 'string',
						default: null,
						meta: {},
						settings: {
							enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
							required: true,
						},
					},
				},
			},
			'border-radius': {
				kind: 'object',
				key: 'border-radius',
				default: null,
				meta: {},
				settings: {},
				shape: {
					'start-start': {
						kind: 'object',
						key: 'size',
						default: null,
						meta: {},
						settings: {},
						shape: {
							size: {
								kind: 'plain',
								key: 'number',
								default: null,
								meta: {},
								settings: {
									required: true,
								},
							},
							unit: {
								kind: 'plain',
								key: 'string',
								default: null,
								meta: {},
								settings: {
									enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
									required: true,
								},
							},
						},
					},
					'start-end': {
						kind: 'object',
						key: 'size',
						default: null,
						meta: {},
						settings: {},
						shape: {
							size: {
								kind: 'plain',
								key: 'number',
								default: null,
								meta: {},
								settings: {
									required: true,
								},
							},
							unit: {
								kind: 'plain',
								key: 'string',
								default: null,
								meta: {},
								settings: {
									enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
									required: true,
								},
							},
						},
					},
					'end-start': {
						kind: 'object',
						key: 'size',
						default: null,
						meta: {},
						settings: {},
						shape: {
							size: {
								kind: 'plain',
								key: 'number',
								default: null,
								meta: {},
								settings: {
									required: true,
								},
							},
							unit: {
								kind: 'plain',
								key: 'string',
								default: null,
								meta: {},
								settings: {
									enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
									required: true,
								},
							},
						},
					},
					'end-end': {
						kind: 'object',
						key: 'size',
						default: null,
						meta: {},
						settings: {},
						shape: {
							size: {
								kind: 'plain',
								key: 'number',
								default: null,
								meta: {},
								settings: {
									required: true,
								},
							},
							unit: {
								kind: 'plain',
								key: 'string',
								default: null,
								meta: {},
								settings: {
									enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
									required: true,
								},
							},
						},
					},
				},
			},
		},
	},
	'border-width': {
		kind: 'object',
		key: 'border-width',
		default: null,
		meta: {},
		settings: {},
		shape: {
			'block-start': {
				kind: 'object',
				key: 'size',
				default: null,
				meta: {},
				settings: {},
				shape: {
					size: {
						kind: 'plain',
						key: 'number',
						default: null,
						meta: {},
						settings: {
							required: true,
						},
					},
					unit: {
						kind: 'plain',
						key: 'string',
						default: null,
						meta: {},
						settings: {
							enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
							required: true,
						},
					},
				},
			},
			'block-end': {
				kind: 'object',
				key: 'size',
				default: null,
				meta: {},
				settings: {},
				shape: {
					size: {
						kind: 'plain',
						key: 'number',
						default: null,
						meta: {},
						settings: {
							required: true,
						},
					},
					unit: {
						kind: 'plain',
						key: 'string',
						default: null,
						meta: {},
						settings: {
							enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
							required: true,
						},
					},
				},
			},
			'inline-start': {
				kind: 'object',
				key: 'size',
				default: null,
				meta: {},
				settings: {},
				shape: {
					size: {
						kind: 'plain',
						key: 'number',
						default: null,
						meta: {},
						settings: {
							required: true,
						},
					},
					unit: {
						kind: 'plain',
						key: 'string',
						default: null,
						meta: {},
						settings: {
							enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
							required: true,
						},
					},
				},
			},
			'inline-end': {
				kind: 'object',
				key: 'size',
				default: null,
				meta: {},
				settings: {},
				shape: {
					size: {
						kind: 'plain',
						key: 'number',
						default: null,
						meta: {},
						settings: {
							required: true,
						},
					},
					unit: {
						kind: 'plain',
						key: 'string',
						default: null,
						meta: {},
						settings: {
							enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
							required: true,
						},
					},
				},
			},
		},
	},
	background: {
		kind: 'object',
		key: 'background',
		default: null,
		meta: {},
		settings: {},
		shape: {
			'background-overlay': {
				kind: 'array',
				key: 'background-overlay',
				default: null,
				meta: {},
				settings: {},
				item_prop_type: {
					kind: 'union',
					default: null,
					meta: {},
					settings: {},
					prop_types: {
						'background-image-overlay': {
							kind: 'object',
							key: 'background-image-overlay',
							default: null,
							meta: {},
							settings: {},
							shape: {
								image: {
									kind: 'object',
									key: 'image',
									default: null,
									meta: {},
									settings: {},
									shape: {
										src: {
											kind: 'object',
											key: 'image-src',
											default: null,
											meta: {},
											settings: {},
											shape: {
												id: {
													kind: 'plain',
													key: 'image-attachment-id',
													default: null,
													meta: {},
													settings: {},
												},
												url: {
													kind: 'plain',
													key: 'url',
													default: null,
													meta: {},
													settings: {},
												},
											},
										},
										size: {
											kind: 'plain',
											key: 'string',
											default: null,
											meta: {},
											settings: {},
										},
									},
								},
								repeat: {
									kind: 'plain',
									key: 'string',
									default: null,
									meta: {},
									settings: {
										enum: [ 'repeat', 'repeat-x', 'repeat-y', 'no-repeat' ],
									},
								},
								size: {
									kind: 'union',
									default: null,
									meta: {},
									settings: {},
									prop_types: {
										'background-image-size-scale': {
											kind: 'object',
											key: 'background-image-size-scale',
											default: null,
											meta: {},
											settings: {},
											shape: {
												width: {
													kind: 'union',
													default: null,
													meta: {},
													settings: {},
													prop_types: {
														size: {
															kind: 'object',
															key: 'size',
															default: null,
															meta: {},
															settings: {},
															shape: {
																size: {
																	kind: 'plain',
																	key: 'number',
																	default: null,
																	meta: {},
																	settings: {
																		required: true,
																	},
																},
																unit: {
																	kind: 'plain',
																	key: 'string',
																	default: null,
																	meta: {},
																	settings: {
																		enum: [
																			'px',
																			'em',
																			'rem',
																			'%',
																			'vh',
																			'vw',
																			'auto',
																			'vmin',
																			'vmax',
																		],
																		required: true,
																	},
																},
															},
														},
														string: {
															kind: 'plain',
															key: 'string',
															default: null,
															meta: {},
															settings: {
																enum: [ 'auto' ],
															},
														},
													},
												},
												height: {
													kind: 'union',
													default: null,
													meta: {},
													settings: {},
													prop_types: {
														size: {
															kind: 'object',
															key: 'size',
															default: null,
															meta: {},
															settings: {},
															shape: {
																size: {
																	kind: 'plain',
																	key: 'number',
																	default: null,
																	meta: {},
																	settings: {
																		required: true,
																	},
																},
																unit: {
																	kind: 'plain',
																	key: 'string',
																	default: null,
																	meta: {},
																	settings: {
																		enum: [
																			'px',
																			'em',
																			'rem',
																			'%',
																			'vh',
																			'vw',
																			'auto',
																			'vmin',
																			'vmax',
																		],
																		required: true,
																	},
																},
															},
														},
														string: {
															kind: 'plain',
															key: 'string',
															default: null,
															meta: {},
															settings: {
																enum: [ 'auto' ],
															},
														},
													},
												},
											},
										},
										string: {
											kind: 'plain',
											key: 'string',
											default: null,
											meta: {},
											settings: {
												enum: [ 'auto', 'cover', 'contain' ],
											},
										},
									},
								},
								attachment: {
									kind: 'plain',
									key: 'string',
									default: null,
									meta: {},
									settings: {
										enum: [ 'fixed', 'scroll' ],
									},
								},
								position: {
									kind: 'union',
									default: null,
									meta: {},
									settings: {},
									prop_types: {
										'background-image-position-offset': {
											kind: 'object',
											key: 'background-image-position-offset',
											default: null,
											meta: {},
											settings: {},
											shape: {
												x: {
													kind: 'union',
													default: null,
													meta: {},
													settings: {},
													prop_types: {
														size: {
															kind: 'object',
															key: 'size',
															default: null,
															meta: {},
															settings: {},
															shape: {
																size: {
																	kind: 'plain',
																	key: 'number',
																	default: null,
																	meta: {},
																	settings: {
																		required: true,
																	},
																},
																unit: {
																	kind: 'plain',
																	key: 'string',
																	default: null,
																	meta: {},
																	settings: {
																		enum: [
																			'px',
																			'em',
																			'rem',
																			'%',
																			'vh',
																			'vw',
																			'vmin',
																			'vmax',
																		],
																		required: true,
																	},
																},
															},
														},
													},
												},
												y: {
													kind: 'union',
													default: null,
													meta: {},
													settings: {},
													prop_types: {
														size: {
															kind: 'object',
															key: 'size',
															default: null,
															meta: {},
															settings: {},
															shape: {
																size: {
																	kind: 'plain',
																	key: 'number',
																	default: null,
																	meta: {},
																	settings: {
																		required: true,
																	},
																},
																unit: {
																	kind: 'plain',
																	key: 'string',
																	default: null,
																	meta: {},
																	settings: {
																		enum: [
																			'px',
																			'em',
																			'rem',
																			'%',
																			'vh',
																			'vw',
																			'vmin',
																			'vmax',
																		],
																		required: true,
																	},
																},
															},
														},
													},
												},
											},
										},
									},
								},
								string: {
									kind: 'plain',
									key: 'string',
									default: null,
									meta: {},
									settings: {
										enum: [
											'center center',
											'center left',
											'center right',
											'top center',
											'top left',
											'top right',
											'bottom center',
											'bottom left',
											'bottom right',
										],
									},
								},
							},
						},
						'background-gradient-overlay': {
							kind: 'object',
							key: 'background-gradient-overlay',
							default: null,
							meta: {},
							settings: {},
							shape: {
								type: {
									kind: 'plain',
									key: 'string',
									default: null,
									meta: {},
									settings: {
										enum: [ 'linear', 'radial' ],
									},
								},
								angle: {
									kind: 'plain',
									key: 'number',
									default: null,
									meta: {},
									settings: {
										required: true,
									},
								},
								positions: {
									kind: 'plain',
									key: 'string',
									default: null,
									meta: {},
									settings: {
										enum: [
											'center center',
											'center left',
											'center right',
											'top center',
											'top left',
											'top right',
											'bottom center',
											'bottom left',
											'bottom right',
										],
									},
								},
								stops: {
									kind: 'array',
									key: 'gradient-color-stop',
									default: null,
									meta: {},
									settings: {},
									item_prop_type: {
										kind: 'object',
										key: 'color-stop',
										default: null,
										meta: {},
										settings: {},
										shape: {
											color: {
												kind: 'plain',
												key: 'color',
												default: null,
												meta: {},
												settings: {},
											},
											offset: {
												kind: 'plain',
												key: 'number',
												default: null,
												meta: {},
												settings: {},
											},
										},
									},
								},
							},
						},
						'background-color-overlay': {
							kind: 'object',
							key: 'background-color-overlay',
							default: null,
							meta: {},
							settings: {},
							shape: {
								color: {
									kind: 'plain',
									key: 'color',
									default: null,
									meta: {},
									settings: {},
								},
							},
						},
					},
				},
			},
			color: {
				kind: 'plain',
				key: 'color',
				default: null,
				meta: {},
				settings: {},
			},
		},
	},
	filter: {
		kind: 'array',
		key: 'filter',
		default: null,
		meta: {},
		settings: {},
		item_prop_type: {
			kind: 'union',
			default: null,
			meta: {},
			settings: {},
			prop_types: {
				...createMockSingleSizeFilterPropType(),
			},
		},
	},
	'backdrop-filter': {
		kind: 'array',
		key: 'backdrop-filter',
		default: null,
		meta: {},
		settings: {},
		item_prop_type: {
			kind: 'union',
			default: null,
			meta: {},
			settings: {},
			prop_types: {
				...createMockSingleSizeFilterPropType(),
			},
		},
	},
	'box-shadow': {
		kind: 'array',
		key: 'box-shadow',
		default: null,
		meta: {},
		settings: {},
		item_prop_type: {
			kind: 'object',
			key: 'shadow',
			default: null,
			meta: {},
			settings: {},
			shape: {
				hOffset: {
					kind: 'object',
					key: 'size',
					default: null,
					meta: {},
					settings: {
						required: true,
					},
					shape: {
						size: {
							kind: 'plain',
							key: 'number',
							default: null,
							meta: {},
							settings: {
								required: true,
							},
						},
						unit: {
							kind: 'plain',
							key: 'string',
							default: null,
							meta: {},
							settings: {
								enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
								required: true,
							},
						},
					},
				},
				vOffset: {
					kind: 'object',
					key: 'size',
					default: null,
					meta: {},
					settings: {
						required: true,
					},
					shape: {
						size: {
							kind: 'plain',
							key: 'number',
							default: null,
							meta: {},
							settings: {
								required: true,
							},
						},
						unit: {
							kind: 'plain',
							key: 'string',
							default: null,
							meta: {},
							settings: {
								enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
								required: true,
							},
						},
					},
				},
				blur: {
					kind: 'object',
					key: 'size',
					default: null,
					meta: {},
					settings: {
						required: true,
					},
					shape: {
						size: {
							kind: 'plain',
							key: 'number',
							default: null,
							meta: {},
							settings: {
								required: true,
							},
						},
						unit: {
							kind: 'plain',
							key: 'string',
							default: null,
							meta: {},
							settings: {
								enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
								required: true,
							},
						},
					},
				},
				spread: {
					kind: 'object',
					key: 'size',
					default: null,
					meta: {},
					settings: {
						required: true,
					},
					shape: {
						size: {
							kind: 'plain',
							key: 'number',
							default: null,
							meta: {},
							settings: {
								required: true,
							},
						},
						unit: {
							kind: 'plain',
							key: 'string',
							default: null,
							meta: {},
							settings: {
								enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
								required: true,
							},
						},
					},
				},
				color: {
					kind: 'plain',
					key: 'color',
					default: null,
					meta: {},
					settings: {
						required: true,
					},
				},
				position: {
					kind: 'plain',
					key: 'string',
					default: null,
					meta: {},
					settings: {
						enum: [ 'inset' ],
					},
				},
			},
		},
	},
	gap: {
		kind: 'object',
		key: 'layout-direction',
		default: null,
		meta: {},
		settings: {},
		shape: {
			isLinked: {
				kind: 'plain',
				key: 'boolean',
				default: null,
				meta: {},
				settings: {},
			},
			column: {
				kind: 'object',
				key: 'size',
				default: null,
				meta: {},
				settings: {},
				shape: {
					size: {
						kind: 'plain',
						key: 'number',
						default: null,
						meta: {},
						settings: {
							required: true,
						},
					},
					unit: {
						kind: 'plain',
						key: 'string',
						default: null,
						meta: {},
						settings: {
							enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
							required: true,
						},
					},
				},
			},
			row: {
				kind: 'object',
				key: 'size',
				default: null,
				meta: {},
				settings: {},
				shape: {
					size: {
						kind: 'plain',
						key: 'number',
						default: null,
						meta: {},
						settings: {
							required: true,
						},
					},
					unit: {
						kind: 'plain',
						key: 'string',
						default: null,
						meta: {},
						settings: {
							enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
							required: true,
						},
					},
				},
			},
		},
	},
	flex: {
		kind: 'object',
		key: 'flex',
		default: null,
		meta: {},
		settings: {},
		shape: {
			flexGrow: {
				kind: 'plain',
				key: 'number',
				default: null,
				meta: {},
				settings: {},
			},
			flexShrink: {
				kind: 'plain',
				key: 'number',
				default: null,
				meta: {},
				settings: {},
			},
			flexBasis: {
				kind: 'union',
				default: null,
				meta: {},
				settings: {},
				prop_types: {
					size: {
						kind: 'object',
						key: 'size',
						default: null,
						meta: {},
						settings: {},
						shape: {
							size: {
								kind: 'plain',
								key: 'number',
								default: null,
								meta: {},
								settings: {
									required: true,
								},
							},
							unit: {
								kind: 'plain',
								key: 'string',
								default: null,
								meta: {},
								settings: {
									enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ],
									required: true,
								},
							},
						},
					},
					string: {
						kind: 'plain',
						key: 'string',
						default: null,
						meta: {},
						settings: {
							enum: [ 'auto' ],
						},
					},
				},
			},
		},
	},
} satisfies PropsSchema;
