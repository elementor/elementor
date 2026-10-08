<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
  'menu_name' => [
    'type' => 'text',
    'default' => 'Menu',
  ],
  'menu' => [
    'type' => 'select',
    'options' => [
      'main-menu' => 'main-menu',
    ],
    'default' => 'main-menu',
  ],
  'layout' => [
    'type' => 'select',
    'default' => 'horizontal',
    'options' => [
      'horizontal' => 'horizontal',
      'vertical' => 'vertical',
      'dropdown' => 'dropdown',
    ],
  ],
  'align_items' => [
    'type' => 'choose',
    'options' => [
      'start' => 'start',
      'center' => 'center',
      'end' => 'end',
      'justify' => 'justify',
    ],
    'condition' => [
      'layout!' => 'dropdown',
    ],
  ],
  'pointer' => [
    'type' => 'select',
    'default' => 'underline',
    'options' => [
      'none' => 'none',
      'underline' => 'underline',
      'overline' => 'overline',
      'double-line' => 'double-line',
      'framed' => 'framed',
      'background' => 'background',
      'text' => 'text',
    ],
    'condition' => [
      'layout!' => 'dropdown',
    ],
  ],
  'animation_line' => [
    'type' => 'select',
    'default' => 'fade',
    'options' => [
      'fade' => 'fade',
      'slide' => 'slide',
      'grow' => 'grow',
      'drop-in' => 'drop-in',
      'drop-out' => 'drop-out',
      'none' => 'none',
    ],
    'condition' => [
      'layout!' => 'dropdown',
      'pointer' => [
        0 => 'underline',
        1 => 'overline',
        2 => 'double-line',
      ],
    ],
  ],
  'animation_framed' => [
    'type' => 'select',
    'default' => 'fade',
    'options' => [
      'fade' => 'fade',
      'grow' => 'grow',
      'shrink' => 'shrink',
      'draw' => 'draw',
      'corners' => 'corners',
      'none' => 'none',
    ],
    'condition' => [
      'layout!' => 'dropdown',
      'pointer' => 'framed',
    ],
  ],
  'animation_background' => [
    'type' => 'select',
    'default' => 'fade',
    'options' => [
      'fade' => 'fade',
      'grow' => 'grow',
      'shrink' => 'shrink',
      'sweep-left' => 'sweep-left',
      'sweep-right' => 'sweep-right',
      'sweep-up' => 'sweep-up',
      'sweep-down' => 'sweep-down',
      'shutter-in-vertical' => 'shutter-in-vertical',
      'shutter-out-vertical' => 'shutter-out-vertical',
      'shutter-in-horizontal' => 'shutter-in-horizontal',
      'shutter-out-horizontal' => 'shutter-out-horizontal',
      'none' => 'none',
    ],
    'condition' => [
      'layout!' => 'dropdown',
      'pointer' => 'background',
    ],
  ],
  'animation_text' => [
    'type' => 'select',
    'default' => 'grow',
    'options' => [
      'grow' => 'grow',
      'shrink' => 'shrink',
      'sink' => 'sink',
      'float' => 'float',
      'skew' => 'skew',
      'rotate' => 'rotate',
      'none' => 'none',
    ],
    'condition' => [
      'layout!' => 'dropdown',
      'pointer' => 'text',
    ],
  ],
  'submenu_icon' => [
    'type' => 'icons',
  ],
  'dropdown' => [
    'type' => 'select',
    'default' => 'tablet',
    'options' => [
      'mobile' => 'mobile',
      'tablet' => 'tablet',
      'none' => 'none',
    ],
    'condition' => [
      'layout!' => 'dropdown',
    ],
  ],
  'full_width' => [
    'type' => 'switcher',
    'return_value' => 'stretch',
    'condition' => [
      'dropdown!' => 'none',
    ],
  ],
  'text_align' => [
    'type' => 'select',
    'default' => 'aside',
    'options' => [
      'aside' => 'aside',
      'center' => 'center',
    ],
    'condition' => [
      'dropdown!' => 'none',
    ],
  ],
  'toggle' => [
    'type' => 'select',
    'default' => 'burger',
    'options' => [
      '' => '',
      'burger' => 'burger',
    ],
    'condition' => [
      'dropdown!' => 'none',
    ],
  ],
  'toggle_icon_normal' => [
    'type' => 'icons',
    'condition' => [
      'toggle' => 'burger',
    ],
  ],
  'toggle_icon_hover_animation' => [
    'type' => 'hover_animation',
    'condition' => [
      'toggle' => 'burger',
    ],
  ],
  'toggle_icon_active' => [
    'type' => 'icons',
    'condition' => [
      'toggle' => 'burger',
    ],
  ],
  'toggle_align' => [
    'type' => 'choose',
    'default' => 'center',
    'options' => [
      'left' => 'left',
      'center' => 'center',
      'right' => 'right',
    ],
    'selectors_dictionary' => [
      'left' => 'margin-right: auto',
      'center' => 'margin: 0 auto',
      'right' => 'margin-left: auto',
    ],
    'condition' => [
      'toggle!' => '',
      'dropdown!' => 'none',
    ],
  ],
  'menu_typography_typography' => [
    'type' => 'popover_toggle',
    'condition' => [
      'layout!' => 'dropdown',
    ],
    'return_value' => 'custom',
  ],
  'menu_typography_font_family' => [
    'type' => 'font',
    'condition' => [
      'layout!' => 'dropdown',
      'menu_typography_typography!' => '',
    ],
  ],
  'menu_typography_font_size' => [
    'type' => 'slider',
    'condition' => [
      'layout!' => 'dropdown',
      'menu_typography_typography!' => '',
    ],
    'is_responsive' => true,
  ],
  'menu_typography_font_weight' => [
    'type' => 'select',
    'condition' => [
      'layout!' => 'dropdown',
      'menu_typography_typography!' => '',
    ],
    'options' => [
      100 => '100',
      200 => '200',
      300 => '300',
      400 => '400',
      500 => '500',
      600 => '600',
      700 => '700',
      800 => '800',
      900 => '900',
      '' => '',
      'normal' => 'normal',
      'bold' => 'bold',
    ],
  ],
  'menu_typography_text_transform' => [
    'type' => 'select',
    'condition' => [
      'layout!' => 'dropdown',
      'menu_typography_typography!' => '',
    ],
    'options' => [
      '' => '',
      'uppercase' => 'uppercase',
      'lowercase' => 'lowercase',
      'capitalize' => 'capitalize',
      'none' => 'none',
    ],
  ],
  'menu_typography_font_style' => [
    'type' => 'select',
    'condition' => [
      'layout!' => 'dropdown',
      'menu_typography_typography!' => '',
    ],
    'options' => [
      '' => '',
      'normal' => 'normal',
      'italic' => 'italic',
      'oblique' => 'oblique',
    ],
  ],
  'menu_typography_text_decoration' => [
    'type' => 'select',
    'condition' => [
      'layout!' => 'dropdown',
      'menu_typography_typography!' => '',
    ],
    'options' => [
      '' => '',
      'underline' => 'underline',
      'overline' => 'overline',
      'line-through' => 'line-through',
      'none' => 'none',
    ],
  ],
  'menu_typography_line_height' => [
    'type' => 'slider',
    'condition' => [
      'layout!' => 'dropdown',
      'menu_typography_typography!' => '',
    ],
    'is_responsive' => true,
  ],
  'menu_typography_letter_spacing' => [
    'type' => 'slider',
    'condition' => [
      'layout!' => 'dropdown',
      'menu_typography_typography!' => '',
    ],
    'is_responsive' => true,
  ],
  'menu_typography_word_spacing' => [
    'type' => 'slider',
    'condition' => [
      'layout!' => 'dropdown',
      'menu_typography_typography!' => '',
    ],
    'is_responsive' => true,
  ],
  'color_menu_item' => [
    'type' => 'color',
    'condition' => [
      'layout!' => 'dropdown',
    ],
  ],
  'color_menu_item_hover' => [
    'type' => 'color',
    'condition' => [
      'layout!' => 'dropdown',
      'pointer!' => 'background',
    ],
  ],
  'color_menu_item_hover_pointer_bg' => [
    'type' => 'color',
    'condition' => [
      'layout!' => 'dropdown',
      'pointer' => 'background',
    ],
    'default' => '#fff',
  ],
  'pointer_color_menu_item_hover' => [
    'type' => 'color',
    'condition' => [
      'layout!' => 'dropdown',
      'pointer!' => [
        0 => 'none',
        1 => 'text',
      ],
    ],
  ],
  'color_menu_item_active' => [
    'type' => 'color',
    'condition' => [
      'layout!' => 'dropdown',
    ],
  ],
  'pointer_color_menu_item_active' => [
    'type' => 'color',
    'condition' => [
      'layout!' => 'dropdown',
      'pointer!' => [
        0 => 'none',
        1 => 'text',
      ],
    ],
  ],
  'nav_menu_divider' => [
    'type' => 'switcher',
    'condition' => [
      'layout!' => 'dropdown',
      'layout' => 'horizontal',
    ],
  ],
  'nav_menu_divider_style' => [
    'type' => 'select',
    'condition' => [
      'layout!' => 'dropdown',
      'nav_menu_divider' => 'yes',
      'layout' => 'horizontal',
    ],
    'options' => [
      'solid' => 'solid',
      'double' => 'double',
      'dotted' => 'dotted',
      'dashed' => 'dashed',
    ],
    'default' => 'solid',
  ],
  'nav_menu_divider_weight' => [
    'type' => 'slider',
    'condition' => [
      'layout!' => 'dropdown',
      'nav_menu_divider' => 'yes',
      'layout' => 'horizontal',
    ],
  ],
  'nav_menu_divider_height' => [
    'type' => 'slider',
    'condition' => [
      'layout!' => 'dropdown',
      'nav_menu_divider' => 'yes',
      'layout' => 'horizontal',
    ],
  ],
  'nav_menu_divider_color' => [
    'type' => 'color',
    'condition' => [
      'layout!' => 'dropdown',
      'nav_menu_divider' => 'yes',
      'layout' => 'horizontal',
    ],
  ],
  'pointer_width' => [
    'type' => 'slider',
    'condition' => [
      'layout!' => 'dropdown',
      'pointer' => [
        0 => 'underline',
        1 => 'overline',
        2 => 'double-line',
        3 => 'framed',
      ],
    ],
    'is_responsive' => true,
  ],
  'padding_horizontal_menu_item' => [
    'type' => 'slider',
    'condition' => [
      'layout!' => 'dropdown',
    ],
    'is_responsive' => true,
  ],
  'padding_vertical_menu_item' => [
    'type' => 'slider',
    'condition' => [
      'layout!' => 'dropdown',
    ],
    'is_responsive' => true,
  ],
  'menu_space_between' => [
    'type' => 'slider',
    'condition' => [
      'layout!' => 'dropdown',
    ],
    'is_responsive' => true,
  ],
  'border_radius_menu_item' => [
    'type' => 'slider',
    'condition' => [
      'layout!' => 'dropdown',
      'pointer' => 'background',
    ],
    'is_responsive' => true,
  ],
  'color_dropdown_item' => [
    'type' => 'color',
  ],
  'background_color_dropdown_item' => [
    'type' => 'color',
  ],
  'color_dropdown_item_hover' => [
    'type' => 'color',
  ],
  'background_color_dropdown_item_hover' => [
    'type' => 'color',
  ],
  'color_dropdown_item_active' => [
    'type' => 'color',
  ],
  'background_color_dropdown_item_active' => [
    'type' => 'color',
  ],
  'dropdown_typography_typography' => [
    'type' => 'popover_toggle',
    'return_value' => 'custom',
  ],
  'dropdown_typography_font_family' => [
    'type' => 'font',
    'condition' => [
      'dropdown_typography_typography!' => '',
    ],
  ],
  'dropdown_typography_font_size' => [
    'type' => 'slider',
    'condition' => [
      'dropdown_typography_typography!' => '',
    ],
    'is_responsive' => true,
  ],
  'dropdown_typography_font_weight' => [
    'type' => 'select',
    'options' => [
      100 => '100',
      200 => '200',
      300 => '300',
      400 => '400',
      500 => '500',
      600 => '600',
      700 => '700',
      800 => '800',
      900 => '900',
      '' => '',
      'normal' => 'normal',
      'bold' => 'bold',
    ],
    'condition' => [
      'dropdown_typography_typography!' => '',
    ],
  ],
  'dropdown_typography_text_transform' => [
    'type' => 'select',
    'options' => [
      '' => '',
      'uppercase' => 'uppercase',
      'lowercase' => 'lowercase',
      'capitalize' => 'capitalize',
      'none' => 'none',
    ],
    'condition' => [
      'dropdown_typography_typography!' => '',
    ],
  ],
  'dropdown_typography_font_style' => [
    'type' => 'select',
    'options' => [
      '' => '',
      'normal' => 'normal',
      'italic' => 'italic',
      'oblique' => 'oblique',
    ],
    'condition' => [
      'dropdown_typography_typography!' => '',
    ],
  ],
  'dropdown_typography_text_decoration' => [
    'type' => 'select',
    'options' => [
      '' => '',
      'underline' => 'underline',
      'overline' => 'overline',
      'line-through' => 'line-through',
      'none' => 'none',
    ],
    'condition' => [
      'dropdown_typography_typography!' => '',
    ],
  ],
  'dropdown_typography_letter_spacing' => [
    'type' => 'slider',
    'condition' => [
      'dropdown_typography_typography!' => '',
    ],
    'is_responsive' => true,
  ],
  'dropdown_typography_word_spacing' => [
    'type' => 'slider',
    'condition' => [
      'dropdown_typography_typography!' => '',
    ],
    'is_responsive' => true,
  ],
  'dropdown_border_border' => [
    'type' => 'select',
    'options' => [
      '' => '',
      'none' => 'none',
      'solid' => 'solid',
      'double' => 'double',
      'dotted' => 'dotted',
      'dashed' => 'dashed',
      'groove' => 'groove',
    ],
  ],
  'dropdown_border_width' => [
    'type' => 'dimensions',
    'condition' => [
      'dropdown_border_border!' => [
        0 => '',
        1 => 'none',
      ],
    ],
    'is_responsive' => true,
  ],
  'dropdown_border_color' => [
    'type' => 'color',
    'condition' => [
      'dropdown_border_border!' => [
        0 => '',
        1 => 'none',
      ],
    ],
  ],
  'dropdown_border_radius' => [
    'type' => 'dimensions',
    'is_responsive' => true,
  ],
  'dropdown_box_shadow_box_shadow_type' => [
    'type' => 'popover_toggle',
    'return_value' => 'yes',
  ],
  'dropdown_box_shadow_box_shadow' => [
    'type' => 'box_shadow',
    'condition' => [
      'dropdown_box_shadow_box_shadow_type!' => '',
    ],
  ],
  'padding_horizontal_dropdown_item' => [
    'type' => 'slider',
    'is_responsive' => true,
  ],
  'padding_vertical_dropdown_item' => [
    'type' => 'slider',
    'is_responsive' => true,
  ],
  'dropdown_divider_border' => [
    'type' => 'select',
    'options' => [
      '' => '',
      'none' => 'none',
      'solid' => 'solid',
      'double' => 'double',
      'dotted' => 'dotted',
      'dashed' => 'dashed',
      'groove' => 'groove',
    ],
  ],
  'dropdown_divider_color' => [
    'type' => 'color',
    'condition' => [
      'dropdown_divider_border!' => [
        0 => '',
        1 => 'none',
      ],
    ],
  ],
  'dropdown_divider_width' => [
    'type' => 'slider',
    'condition' => [
      'dropdown_divider_border!' => '',
    ],
  ],
  'dropdown_top_distance' => [
    'type' => 'slider',
    'is_responsive' => true,
  ],
  'toggle_color' => [
    'type' => 'color',
    'condition' => [
      'toggle!' => '',
      'dropdown!' => 'none',
    ],
  ],
  'toggle_background_color' => [
    'type' => 'color',
    'condition' => [
      'toggle!' => '',
      'dropdown!' => 'none',
    ],
  ],
  'toggle_color_hover' => [
    'type' => 'color',
    'condition' => [
      'toggle!' => '',
      'dropdown!' => 'none',
    ],
  ],
  'toggle_background_color_hover' => [
    'type' => 'color',
    'condition' => [
      'toggle!' => '',
      'dropdown!' => 'none',
    ],
  ],
  'toggle_size' => [
    'type' => 'slider',
    'condition' => [
      'toggle!' => '',
      'dropdown!' => 'none',
    ],
    'is_responsive' => true,
  ],
  'toggle_border_width' => [
    'type' => 'slider',
    'condition' => [
      'toggle!' => '',
      'dropdown!' => 'none',
    ],
    'is_responsive' => true,
  ],
  'toggle_border_radius' => [
    'type' => 'slider',
    'condition' => [
      'toggle!' => '',
      'dropdown!' => 'none',
    ],
    'is_responsive' => true,
  ],
  '_margin' => [
    'type' => 'dimensions',
    'is_responsive' => true,
  ],
  '_padding' => [
    'type' => 'dimensions',
    'is_responsive' => true,
  ],
  '_element_width' => [
    'type' => 'select',
    'options' => [
      '' => '',
      'inherit' => 'inherit',
      'auto' => 'auto',
      'initial' => 'initial',
    ],
    'selectors_dictionary' => [
      'inherit' => '100%',
    ],
  ],
  '_element_width_tablet' => [
    'type' => 'select',
    'options' => [
      '' => '',
      'inherit' => 'inherit',
      'auto' => 'auto',
      'initial' => 'initial',
    ],
    'selectors_dictionary' => [
      'inherit' => '100%',
    ],
  ],
  '_element_width_mobile' => [
    'type' => 'select',
    'options' => [
      '' => '',
      'inherit' => 'inherit',
      'auto' => 'auto',
      'initial' => 'initial',
    ],
    'selectors_dictionary' => [
      'inherit' => '100%',
    ],
  ],
  '_element_custom_width' => [
    'type' => 'slider',
    'condition' => [
      '_element_width' => 'initial',
    ],
    'is_responsive' => true,
  ],
  '_position' => [
    'type' => 'select',
    'options' => [
      '' => '',
      'absolute' => 'absolute',
      'fixed' => 'fixed',
    ],
  ],
  '_offset_orientation_h' => [
    'type' => 'choose',
    'default' => 'start',
    'options' => [
      'start' => 'start',
      'end' => 'end',
    ],
    'condition' => [
      '_position!' => '',
    ],
  ],
  '_offset_x' => [
    'type' => 'slider',
    'condition' => [
      '_offset_orientation_h!' => 'end',
      '_position!' => '',
    ],
    'is_responsive' => true,
  ],
  '_offset_x_end' => [
    'type' => 'slider',
    'condition' => [
      '_offset_orientation_h' => 'end',
      '_position!' => '',
    ],
    'is_responsive' => true,
  ],
  '_offset_orientation_v' => [
    'type' => 'choose',
    'default' => 'start',
    'options' => [
      'start' => 'start',
      'end' => 'end',
    ],
    'condition' => [
      '_position!' => '',
    ],
  ],
  '_offset_y' => [
    'type' => 'slider',
    'condition' => [
      '_offset_orientation_v!' => 'end',
      '_position!' => '',
    ],
    'is_responsive' => true,
  ],
  '_offset_y_end' => [
    'type' => 'slider',
    'condition' => [
      '_offset_orientation_v' => 'end',
      '_position!' => '',
    ],
    'is_responsive' => true,
  ],
  '_z_index' => [
    'type' => 'number',
    'is_responsive' => true,
  ],
  '_flex_align_self' => [
    'type' => 'choose',
    'options' => [
      'flex-start' => 'flex-start',
      'center' => 'center',
      'flex-end' => 'flex-end',
      'stretch' => 'stretch',
    ],
    'is_responsive' => true,
  ],
  '_flex_size' => [
    'type' => 'choose',
    'options' => [
      'none' => 'none',
      'grow' => 'grow',
      'shrink' => 'shrink',
      'custom' => 'custom',
    ],
    'is_responsive' => true,
  ],
  '_flex_grow' => [
    'type' => 'number',
    'default' => 1,
    'condition' => [
      '_flex_size' => 'custom',
    ],
    'is_responsive' => true,
  ],
  '_flex_shrink' => [
    'type' => 'number',
    'default' => 1,
    'condition' => [
      '_flex_size' => 'custom',
    ],
    'is_responsive' => true,
  ],
  '_background_background' => [
    'type' => 'choose',
    'options' => [
      'classic' => 'classic',
      'gradient' => 'gradient',
    ],
  ],
  '_background_color' => [
    'type' => 'color',
    'condition' => [
      '_background_background' => [
        0 => 'classic',
        1 => 'gradient',
        2 => 'video',
      ],
    ],
  ],
  '_background_hover_background' => [
    'type' => 'choose',
    'options' => [
      'classic' => 'classic',
      'gradient' => 'gradient',
    ],
  ],
  '_background_hover_color' => [
    'type' => 'color',
    'condition' => [
      '_background_hover_background' => [
        0 => 'classic',
        1 => 'gradient',
        2 => 'video',
      ],
    ],
  ],
  '_border_border' => [
    'type' => 'select',
    'options' => [
      '' => '',
      'none' => 'none',
      'solid' => 'solid',
      'double' => 'double',
      'dotted' => 'dotted',
      'dashed' => 'dashed',
      'groove' => 'groove',
    ],
  ],
  '_border_width' => [
    'type' => 'dimensions',
    'condition' => [
      '_border_border!' => [
        0 => '',
        1 => 'none',
      ],
    ],
    'is_responsive' => true,
  ],
  '_border_color' => [
    'type' => 'color',
    'condition' => [
      '_border_border!' => [
        0 => '',
        1 => 'none',
      ],
    ],
  ],
  '_border_radius' => [
    'type' => 'dimensions',
    'is_responsive' => true,
  ],
  '_box_shadow_box_shadow_type' => [
    'type' => 'popover_toggle',
    'return_value' => 'yes',
  ],
  '_box_shadow_box_shadow' => [
    'type' => 'box_shadow',
    'condition' => [
      '_box_shadow_box_shadow_type!' => '',
    ],
  ],
  '_border_hover_border' => [
    'type' => 'select',
    'options' => [
      '' => '',
      'none' => 'none',
      'solid' => 'solid',
      'double' => 'double',
      'dotted' => 'dotted',
      'dashed' => 'dashed',
      'groove' => 'groove',
    ],
  ],
  '_border_hover_width' => [
    'type' => 'dimensions',
    'condition' => [
      '_border_hover_border!' => [
        0 => '',
        1 => 'none',
      ],
    ],
    'is_responsive' => true,
  ],
  '_border_hover_color' => [
    'type' => 'color',
    'condition' => [
      '_border_hover_border!' => [
        0 => '',
        1 => 'none',
      ],
    ],
  ],
  '_border_radius_hover' => [
    'type' => 'dimensions',
    'is_responsive' => true,
  ],
  '_box_shadow_hover_box_shadow_type' => [
    'type' => 'popover_toggle',
    'return_value' => 'yes',
  ],
  '_box_shadow_hover_box_shadow' => [
    'type' => 'box_shadow',
    'condition' => [
      '_box_shadow_hover_box_shadow_type!' => '',
    ],
  ],
];
