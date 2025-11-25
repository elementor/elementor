<?php
namespace Elementor\Modules\Components\Documents;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Component_Overridable_Prop {
	/** @var string */
	public $override_key;

	/** @var string */
	public $element_id;

	/** @var string */
	public $el_type;

	/** @var string */
	public $widget_type;

	/** @var string */
	public $prop_key;

	/** @var string */
	public $label;

	/** @var array{ $$type: string, value: mixed } */
	public $default_value;

	/** @var string */
	public $group_id;

	public function __construct( array $overridable_prop ) {
		$this->override_key = $overridable_prop['overrideKey'];
		$this->element_id = $overridable_prop['elementId'];
		$this->el_type = $overridable_prop['elType'];
		$this->widget_type = $overridable_prop['widgetType'];
		$this->prop_key = $overridable_prop['propKey'];
		$this->label = $overridable_prop['label'];
		$this->default_value = $overridable_prop['defaultValue'];
		$this->group_id = $overridable_prop['groupId'] ?? null;
	}

	public static function make( array $overridable_prop ): self {
		return new self( $overridable_prop );
	}
}
