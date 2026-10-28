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

	/**
	 * The published schema fixes the item shape; whether the attachment exists is only known at write time.
	 * Without this the item would be dropped silently while the rest of the gallery is saved.
	 */
	public function reject_reason( $plain, array $control ): ?string {
		foreach ( is_array( $plain ) ? $plain : [] as $index => $item ) {
			$id = (int) ( $item['id'] ?? 0 );

			if ( 'attachment' !== get_post_type( $id ) ) {
				return sprintf( 'has a missing image: item %s references Media Library id %d, which does not exist (no item in the list was saved)', $index, $id );
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
