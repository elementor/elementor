<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * V3 flex/grid container. Exposed only when the V4 atomic experiment is off so the LLM has a
 * layout box to attach basics into.
 *
 * Container's Style-tab controls write to CSS custom properties on the wrapper rather than to
 * standard CSS properties. Route the natural CSS names an LLM writes onto the underlying
 * settings so a container can be laid out without knowing the internal variable names.
 */

return [
	'widget_type' => 'container',
	'description' => 'V3 flex/grid container. Use as the layout box for other V3 widgets when the V4 atomic experiment is off; when V4 is on, use `e-div-block` or `e-flexbox` instead.',
	'wrapper' => [
		'style_overrides' => [
			// Flex layout — Group_Control_Flex_Container fields, prefixed by the group name `flex`.
			'flex-direction' => [
				'setting' => 'flex_direction',
				'resolver' => 'text',
				'responsive' => true,
			],
			'flex-wrap' => [
				'setting' => 'flex_wrap',
				'resolver' => 'text',
				'responsive' => true,
			],
			'justify-content' => [
				'setting' => 'flex_justify_content',
				'resolver' => 'text',
				'responsive' => true,
			],
			'align-items' => [
				'setting' => 'flex_align_items',
				'resolver' => 'text',
				'responsive' => true,
			],
			'align-content' => [
				'setting' => 'flex_align_content',
				'resolver' => 'text',
				'responsive' => true,
			],
			'gap' => [
				'setting' => 'flex_gap',
				'resolver' => 'gaps',
				'responsive' => true,
			],

			// Grid — Group_Control_Grid_Container fields, prefixed `grid`. `columns_grid` /
			// `rows_grid` are SLIDERs whose `custom` unit path writes `--e-con-grid-template-*`
			// verbatim, so a `raw_slider` resolver forwards any CSS grid-template expression
			// (`repeat(3, 1fr)`, `1fr 2fr 1fr`, `minmax(200px, 1fr) auto`, …) unchanged. Any
			// grid_* setting written flips `container_type` to grid via
			// V3_Value_Resolvers::supplement_container_type_toggle — otherwise the container
			// stays in its default flex mode and the grid CSS is inert.
			'grid-template-columns' => [
				'setting' => 'grid_columns_grid',
				'resolver' => 'raw_slider',
				'responsive' => true,
			],
			'grid-template-rows' => [
				'setting' => 'grid_rows_grid',
				'resolver' => 'raw_slider',
				'responsive' => true,
			],
			'grid-auto-flow' => [
				'setting' => 'grid_auto_flow',
				'resolver' => 'text',
				'responsive' => true,
			],
			'justify-items' => [
				'setting' => 'grid_justify_items',
				'resolver' => 'text',
				'responsive' => true,
			],
			// `display: flex` on a container is redundant — the container is already flex/grid by
			// its own `container_type` setting. Route it there so the write is a no-op instead of
			// a `custom_css` dump; if the LLM writes `display: grid` it flips the mode instead.
			'display' => [
				'setting' => 'container_type',
				'resolver' => 'text',
				'responsive' => false,
			],

			// Border — Group_Control_Border fields, prefixed by the group name `border`.
			// The style-slot setting name is `border_border` (group `border` + field `border`).
			'border-style' => [
				'setting' => 'border_border',
				'resolver' => 'text',
				'responsive' => false,
			],
			'border-width' => [
				'setting' => 'border_width',
				'resolver' => 'sides',
				'responsive' => true,
			],
			'border-top-width' => [
				'setting' => 'border_width',
				'resolver' => 'dimension_side',
				'side' => 'top',
				'responsive' => true,
			],
			'border-right-width' => [
				'setting' => 'border_width',
				'resolver' => 'dimension_side',
				'side' => 'right',
				'responsive' => true,
			],
			'border-bottom-width' => [
				'setting' => 'border_width',
				'resolver' => 'dimension_side',
				'side' => 'bottom',
				'responsive' => true,
			],
			'border-left-width' => [
				'setting' => 'border_width',
				'resolver' => 'dimension_side',
				'side' => 'left',
				'responsive' => true,
			],
			'border-color' => [
				'setting' => 'border_color',
				'resolver' => 'color',
				'responsive' => false,
			],
			'border-radius' => [
				'setting' => 'border_radius',
				'resolver' => 'sides',
				'responsive' => true,
			],
			// Per-side border shorthands (`border-bottom: 1px solid #ccc`) — common for underlines
			// on sticky nav, section dividers. Handled by Border_Shorthand_Converter via the
			// `border_side_prefix` marker.
			'border-top' => [
				'border_side_prefix' => 'border',
				'side' => 'top',
			],
			'border-right' => [
				'border_side_prefix' => 'border',
				'side' => 'right',
			],
			'border-bottom' => [
				'border_side_prefix' => 'border',
				'side' => 'bottom',
			],
			'border-left' => [
				'border_side_prefix' => 'border',
				'side' => 'left',
			],

			// Background — Group_Control_Background field `color`. Container carries FOUR background
			// groups (main, hover, overlay, overlay-hover), each writing `background-color` at a
			// different selector. The generic index drops properties with multiple candidates, so
			// pin the natural ones to the main + hover groups explicitly. The `_background: classic`
			// toggle is supplemented by V3_Value_Resolvers::supplement_background_group_toggles.
			'background-color' => [
				'setting' => 'background_color',
				'resolver' => 'color',
				'responsive' => false,
			],
			'background-color@hover' => [
				'setting' => 'background_hover_color',
				'resolver' => 'color',
				'responsive' => false,
			],

			// Container Overflow control writes `--overflow: {{VALUE}}` — an internal custom property
			// the generic index skips (by prefix `--`). Route the LLM's natural `overflow` onto it.
			'overflow' => [
				'setting' => 'overflow',
				'resolver' => 'text',
				'responsive' => false,
			],

			// Flex-item — Group_Control_Flex_Item on Advanced-tab (`_flex` prefix), applied to
			// `{{WRAPPER}}.e-con`. Controls how this container behaves as a flex child of its parent.
			// All fields write to `--flex-*` custom properties, so the generic index cannot see them.
			'flex-grow' => [
				'setting' => '_flex_grow',
				'resolver' => 'text',
				'responsive' => false,
			],
			'flex-shrink' => [
				'setting' => '_flex_shrink',
				'resolver' => 'text',
				'responsive' => false,
			],
			'align-self' => [
				'setting' => '_flex_align_self',
				'resolver' => 'text',
				'responsive' => true,
			],
			'order' => [
				'setting' => '_flex_order',
				'resolver' => 'text',
				'responsive' => false,
			],

			// max-width on a container is nearly always the "centered boxed content" pattern.
			// V3's native shape is `content_width: boxed` + `boxed_width: X`. Overrides the
			// universal `_element_custom_width` mapping (`element_width_overrides`) since it
			// wouldn't take effect on containers anyway (containers have their own width model).
			'max-width' => [
				'setting' => 'boxed_width',
				'resolver' => 'slider',
				'responsive' => true,
			],

			// Layout advanced-tab controls.
			'min-height' => [
				'setting' => 'min_height',
				'resolver' => 'slider',
				'responsive' => true,
			],
			'position' => [
				'setting' => 'position',
				'resolver' => 'text',
				'responsive' => false,
			],
			'z-index' => [
				'setting' => 'z_index',
				'resolver' => 'text',
				'responsive' => true,
			],
		],
	],
];
