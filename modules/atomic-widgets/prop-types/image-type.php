<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\DynamicTags\Module as DynamicTags;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Type extends Transformable_Type {

	public function get_type(): string {
		return 'image';
	}

	public function validate_value( $value ): void {
		$has_id = isset( $value['attachmentId'] );
		$has_url = isset( $value['url'] );

		if ( ! $has_id && ! $has_url ) {
			throw new \Exception( 'Value must have either an attachmentId or a URL.' );
		}

		if ( $has_id && ! is_numeric( $value['attachmentId'] ) ) {
			throw new \Exception( 'Attachment id must be numeric, ' . gettype( $value['attachmentId'] ) . ' given.' );
		}

		if ( $has_url && ! is_string( $value['url'] ) ) {
			throw new \Exception( 'URL must be a string, ' . gettype( $value['url'] ) . ' given.' );
		}
	}

	public function get_dynamic_categories(): array {
		return [
			DynamicTags::IMAGE_CATEGORY,
		];
	}
}
