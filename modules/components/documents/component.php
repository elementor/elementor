<?php
namespace Elementor\Modules\Components\Documents;

use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Component extends Document {
	const TYPE = 'elementor_component';
	const COMPONENT_UID_META_KEY = '_elementor_component_uid';
	const OVERRIDABLE_PROPS_META_KEY = '_elementor_component_overridable_props';

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['cpt'] = [ self::TYPE ];

		return $properties;
	}

	public static function get_type() {
		return self::TYPE;
	}

	public static function get_title() {
		return esc_html__( 'Component', 'elementor' );
	}

	public static function get_plural_title() {
		return esc_html__( 'Components', 'elementor' );
	}

	public static function get_labels(): array {
		$plural_label   = static::get_plural_title();
		$singular_label = static::get_title();

		$labels = [
			'name' => $plural_label,
			'singular_name' => $singular_label,
		];

		return $labels;
	}

	public static function get_supported_features(): array {
		return [
			'title',
			'author',
			'thumbnail',
			'custom-fields',
			'revisions',
			'elementor',
		];
	}

	public function get_component_uid() {
		return $this->get_meta( self::COMPONENT_UID_META_KEY );
	}

	public function get_overridable_props(): Component_Overridable_Props {
		$meta = $this->get_meta( self::OVERRIDABLE_PROPS_META_KEY );

		return new Component_Overridable_Props( $meta );
	}
}

class Component_Overridable_Props {
	/** @var array{ [string]: Component_Overridable_Prop } */
	public array $props;
	public array $groups;

	private function __construct( $overridable_props_meta ) {
		if ( is_string( $overridable_props_meta ) && ! empty( $overridable_props_meta ) ) {
			$overridable_props_meta = json_decode( $overridable_props_meta, true );
		}

		if ( empty( $overridable_props_meta ) ) {
			$this->props = [];
			$this->groups = [];

		}

		$formatted_props = array_map( function( array $overridable_prop ) {
				return Component_Overridable_Prop::make( $overridable_prop );
		}, $overridable_props_meta['props'] ?? [] );

		$this->props = $formatted_props;
		$this->groups = $overridable_props_meta['groups'] ?? [];
	}

	public static function make( array $overridable_props_meta ): self {
		return new self( $overridable_props_meta );
	}
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
