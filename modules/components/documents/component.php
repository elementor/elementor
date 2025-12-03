<?php
namespace Elementor\Modules\Components\Documents;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Api\Parse_Result;
use Elementor\Modules\Components\OverridableProps\Component_Overridable_Props_Parser;

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

	public function update_overridable_props( $data ): Parse_Result {
		$parser = Component_Overridable_Props_Parser::make();

		$result = $parser->parse( $data );

		if ( ! $result->is_valid() ) {
			return $result;
		}

		$sanitized_data = $result->unwrap();

		$this->update_json_meta( self::OVERRIDABLE_PROPS_META_KEY, $sanitized_data );

		return $result;
	}
}
