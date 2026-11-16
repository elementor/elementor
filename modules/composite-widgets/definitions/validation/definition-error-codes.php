<?php

namespace Elementor\Modules\CompositeWidgets\Definitions\Validation;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Definition_Error_Codes {
	const DEFINITION_INVALID = 'widget_definition_invalid';
	const DUPLICATE_ID = 'widget_definition_duplicate_id';
	const TEMPLATE_NODE_INVALID = 'widget_template_node_invalid';
	const PART_INVALID = 'widget_part_invalid';
	const PART_DUPLICATE = 'widget_part_duplicate';
	const PART_TYPE_NOT_ALLOWED = 'widget_part_type_not_allowed';
	const SLOT_INVALID = 'widget_slot_invalid';
	const SLOT_CONTENT_PART = 'widget_slot_content_part';
	const ELEMENT_TYPE_NOT_FOUND = 'widget_element_type_not_found';
	const REPEATER_ITEM_SHAPE_MISMATCH = 'widget_repeater_item_shape_mismatch';
	const TEMPLATE_SETTINGS_INVALID = 'widget_template_settings_invalid';
	const TEMPLATE_STYLE_INVALID = 'widget_template_style_invalid';
	const GLOBAL_REFERENCE_NOT_ALLOWED = 'widget_global_reference_not_allowed';
	const TARGET_PART_NOT_FOUND = 'widget_target_part_not_found';
	const TARGET_PROP_NOT_FOUND = 'widget_target_prop_not_found';
	const REMOVABLE_PART_INVALID = 'widget_removable_part_invalid';
	const PRESET_STYLE_INVALID = 'widget_preset_style_invalid';
	const QUICK_EDIT_INVALID = 'widget_quick_edit_invalid';
}
