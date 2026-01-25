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
	const ARCHIVED_META_KEY = '_elementor_component_is_archived';
	const ARCHIVED_AT_META_KEY = '_elementor_component_archived_at';
	const COMPONENT_CUSTOM_META_KEYS = [
		self::COMPONENT_UID_META_KEY,
		self::OVERRIDABLE_PROPS_META_KEY,
		self::ARCHIVED_META_KEY,
		self::ARCHIVED_AT_META_KEY,
	];

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
		$meta = $this->get_json_meta( self::OVERRIDABLE_PROPS_META_KEY );

		return Component_Overridable_Props::make( $meta ?? [] );
	}

	public function archive() {
		try {
			$this->update_json_meta( self::ARCHIVED_META_KEY, [
				'is_archived' => true,
				'archived_at' => time(),
			] );
		} catch ( \Exception $e ) {
			throw new \Exception( 'Failed to archive component: ' . esc_html( $e->getMessage() ) );
		}
	}

	public function get_is_archived(): bool {
		$archived_meta = $this->get_json_meta( self::ARCHIVED_META_KEY );

		return $archived_meta['is_archived'] ?? false;
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

	public function update_title( string $title ): bool {
		$sanitized_title = sanitize_text_field( $title );

		if ( empty( $sanitized_title ) ) {
			return false;
		}

		return $this->update_post_field( 'post_title', $sanitized_title );
	}

	public function update_status( string $status ): bool {
		if ( ! in_array( $status, [ Document::STATUS_PUBLISH, Document::STATUS_DRAFT, Document::STATUS_AUTOSAVE ], true ) ) {
			return false;
		}

		return $this->update_post_field( 'post_status', $status );
	}

	private function update_post_field( string $field, $value ): bool {
		$result = wp_update_post( [
			'ID' => $this->post->ID,
			$field => $value,
		] );

		$success = ! is_wp_error( $result ) && $result > 0;

		if ( $success ) {
			$this->refresh_post();
		}

		return $success;
	}
}
