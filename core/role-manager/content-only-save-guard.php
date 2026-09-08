<?php

namespace Elementor\Core\RoleManager;

use Elementor\Core\Base\Document;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Content_Only_Save_Guard {

	private const DESIGN_CAPABILITY = 'design';

	private const FIELD_ELEMENTS = 'elements';

	private const FIELD_INTERACTIONS = 'interactions';

	private const FIELD_SETTINGS = 'settings';

	private const FIELD_STYLES = 'styles';

	private const SETTING_CLASSES = 'classes';

	public function register(): void {
		add_filter( 'elementor/document/save/data', [ $this, 'filter_save_data' ], 10, 2 );
	}

	public function filter_save_data( array $data, Document $document ): array {
		if ( Plugin::$instance->role_manager->user_can( self::DESIGN_CAPABILITY ) ) {
			return $data;
		}

		if ( empty( $data[ self::FIELD_ELEMENTS ] ) || ! is_array( $data[ self::FIELD_ELEMENTS ] ) ) {
			return $data;
		}

		// Restore persisted design values instead of stripping them — the editor posts the full tree on every save.
		$persisted_map = $this->build_elements_map_by_id( $document->get_elements_data() ?? [] );
		$had_overrides = false;

		$data[ self::FIELD_ELEMENTS ] = $this->sanitize_elements_tree(
			$data[ self::FIELD_ELEMENTS ],
			$persisted_map,
			$had_overrides
		);

		if ( $had_overrides ) {
			Plugin::$instance->logger->warning(
				'Restored design fields for a content-only user during document save.',
				[
					'document_id' => $document->get_main_id(),
				]
			);
		}

		return $data;
	}

	private function build_elements_map_by_id( array $elements ): array {
		$map = [];

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			$id = $element['id'] ?? '';

			if ( $id ) {
				$map[ $id ] = $element;
			}

			$children = $element[ self::FIELD_ELEMENTS ] ?? [];

			if ( is_array( $children ) && ! empty( $children ) ) {
				$map = array_merge( $map, $this->build_elements_map_by_id( $children ) );
			}
		}

		return $map;
	}

	private function sanitize_elements_tree( array $elements, array $persisted_map, bool &$had_overrides ): array {
		foreach ( $elements as $index => $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			$elements[ $index ] = $this->sanitize_element_design_fields( $element, $persisted_map, $had_overrides );
		}

		return $elements;
	}

	private function sanitize_element_design_fields( array $element, array $persisted_map, bool &$had_overrides ): array {
		$id = $element['id'] ?? '';
		$persisted = ( $id && isset( $persisted_map[ $id ] ) ) ? $persisted_map[ $id ] : null;

		if ( $persisted ) {
			$element = $this->restore_design_fields( $element, $persisted, $had_overrides );
		} else {
			$element = $this->strip_design_fields( $element, $had_overrides );
		}

		$children = $element[ self::FIELD_ELEMENTS ] ?? [];

		if ( is_array( $children ) && ! empty( $children ) ) {
			$element[ self::FIELD_ELEMENTS ] = $this->sanitize_elements_tree( $children, $persisted_map, $had_overrides );
		}

		return $element;
	}

	private function restore_design_fields( array $incoming, array $persisted, bool &$had_overrides ): array {
		$incoming = $this->restore_top_level_field( $incoming, $persisted, self::FIELD_STYLES, $had_overrides );
		$incoming = $this->restore_top_level_field( $incoming, $persisted, self::FIELD_INTERACTIONS, $had_overrides );

		return $this->restore_settings_classes( $incoming, $persisted, $had_overrides );
	}

	private function restore_top_level_field( array $incoming, array $persisted, string $field, bool &$had_overrides ): array {
		$incoming_has = array_key_exists( $field, $incoming );
		$persisted_has = array_key_exists( $field, $persisted );

		if ( $persisted_has ) {
			if ( ! $incoming_has || $incoming[ $field ] !== $persisted[ $field ] ) {
				$had_overrides = true;
			}

			$incoming[ $field ] = $persisted[ $field ];

			return $incoming;
		}

		if ( $incoming_has ) {
			$had_overrides = true;
			unset( $incoming[ $field ] );
		}

		return $incoming;
	}

	private function restore_settings_classes( array $incoming, array $persisted, bool &$had_overrides ): array {
		$persisted_settings = $persisted[ self::FIELD_SETTINGS ] ?? [];
		$incoming_settings = $incoming[ self::FIELD_SETTINGS ] ?? [];
		$persisted_has = is_array( $persisted_settings ) && array_key_exists( self::SETTING_CLASSES, $persisted_settings );
		$incoming_has = is_array( $incoming_settings ) && array_key_exists( self::SETTING_CLASSES, $incoming_settings );

		if ( $persisted_has ) {
			if ( ! $incoming_has || $incoming_settings[ self::SETTING_CLASSES ] !== $persisted_settings[ self::SETTING_CLASSES ] ) {
				$had_overrides = true;
			}

			$incoming[ self::FIELD_SETTINGS ][ self::SETTING_CLASSES ] = $persisted_settings[ self::SETTING_CLASSES ];

			return $incoming;
		}

		if ( $incoming_has ) {
			$had_overrides = true;
			unset( $incoming[ self::FIELD_SETTINGS ][ self::SETTING_CLASSES ] );
		}

		return $incoming;
	}

	private function strip_design_fields( array $element, bool &$had_overrides ): array {
		if ( array_key_exists( self::FIELD_STYLES, $element ) ) {
			$had_overrides = true;
			unset( $element[ self::FIELD_STYLES ] );
		}

		if ( array_key_exists( self::FIELD_INTERACTIONS, $element ) ) {
			$had_overrides = true;
			unset( $element[ self::FIELD_INTERACTIONS ] );
		}

		if (
			isset( $element[ self::FIELD_SETTINGS ] )
			&& is_array( $element[ self::FIELD_SETTINGS ] )
			&& array_key_exists( self::SETTING_CLASSES, $element[ self::FIELD_SETTINGS ] )
		) {
			$had_overrides = true;
			unset( $element[ self::FIELD_SETTINGS ][ self::SETTING_CLASSES ] );
		}

		return $element;
	}
}
