<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * GALLERY control, stored as a list of `{ id, url }` attachments.
 */
class Gallery_Setting_Adapter implements V3_Setting_Adapter, V3_Plain_Value_Guard {

	const CONTROL_TYPE = 'gallery';

	const ALLOWED_ITEM_KEYS = [ 'id', 'url' ];

	/**
	 * Items that cannot become gallery images are rejected up front; otherwise they would be
	 * dropped silently while the rest of the gallery is saved.
	 */
	public function reject_reason( $plain, array $control ): ?string {
		if ( ! is_array( $plain ) || array_values( $plain ) !== $plain ) {
			return 'is not a list of { id, url } items';
		}

		foreach ( $plain as $index => $item ) {
			if ( ! is_array( $item ) || array_values( $item ) === $item ) {
				return sprintf( 'has item %d that is not an object with an "id"', $index );
			}

			$unknown = array_diff( array_keys( $item ), self::ALLOWED_ITEM_KEYS );

			if ( ! empty( $unknown ) ) {
				return sprintf( 'has item %d with unsupported keys (%s; allowed: id, url)', $index, implode( ', ', $unknown ) );
			}

			$id = $item['id'] ?? null;

			if ( ! ( is_int( $id ) || ( is_float( $id ) && floor( $id ) === $id ) || ( is_string( $id ) && ctype_digit( $id ) ) ) || (int) $id <= 0 ) {
				return sprintf( 'has item %d without a positive numeric "id"', $index );
			}

			if ( 'attachment' !== get_post_type( (int) $id ) ) {
				return sprintf( 'references Media Library id %d, which does not exist', (int) $id );
			}
		}

		return null;
	}

	public function supports( array $control ): bool {
		return self::CONTROL_TYPE === ( $control['type'] ?? null );
	}

	public function prop_type( array $control ): Prop_Type {
		return V3_Gallery_Prop_Type::make();
	}

	public function to_control_value( array $prop_value, array $control ) {
		$items = is_array( $prop_value['value'] ?? null ) ? $prop_value['value'] : [];
		$stored = [];

		foreach ( $items as $item ) {
			$id = (int) ( $item['value']['id']['value'] ?? 0 );

			if ( $id <= 0 ) {
				continue;
			}

			$url = (string) ( $item['value']['url']['value'] ?? '' );

			$stored[] = [
				'id' => $id,
				'url' => '' !== $url ? $url : (string) wp_get_attachment_url( $id ),
			];
		}

		return $stored;
	}

	public function from_control_value( $stored, array $control ) {
		if ( ! is_array( $stored ) ) {
			return null;
		}

		$plain = [];

		foreach ( $stored as $item ) {
			if ( ! is_array( $item ) || empty( $item['id'] ) || ! is_numeric( $item['id'] ) ) {
				continue;
			}

			$plain[] = [
				'id' => (int) $item['id'],
				'url' => (string) ( $item['url'] ?? '' ),
			];
		}

		return $plain;
	}
}
