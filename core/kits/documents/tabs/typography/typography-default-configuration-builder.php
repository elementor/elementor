<?php
namespace Elementor\Core\Kits\Documents\Tabs\Typography;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Typography_Default_Configuration_Builder {

	const TYPOGRAPHY_NAME = 'typography';
	const TYPOGRAPHY_GROUP_PREFIX = self::TYPOGRAPHY_NAME . '_';
	const TYPOGRAPHY_KEY = self::TYPOGRAPHY_GROUP_PREFIX . 'typography';

	/**
	 * Builds typography per type and allows adding new default values based on Elementor version
	 * @param $typography_type - the typography type ( use Default_Typography_Type class )
	 * @return array
	 */
	public function build_typography( $typography_type ) {

		switch ( $typography_type ) {
			case Default_Typography_Type::PRIMARY:
				$config = array_merge(
					[
						'_id' => $typography_type,
						'title' => esc_html__( 'Primary', 'elementor' ),
						self::TYPOGRAPHY_KEY => 'custom',
					],
					$this->build_responsive_typography_configuration( Typography_Control_Type::FONT_FAMILY, 'Roboto', 'Roboto', 'Roboto' ),
					$this->build_responsive_typography_configuration( Typography_Control_Type::FONT_WEIGHT, '600', '600', '600' )
				);
				return $this->append_defaults_per_version( $config, $typography_type );

			case Default_Typography_Type::SECONDARY:
				$config = array_merge(
					[
						'_id' => $typography_type,
						'title' => esc_html__( 'Secondary', 'elementor' ),
						self::TYPOGRAPHY_KEY => 'custom',
					],
					$this->build_responsive_typography_configuration( Typography_Control_Type::FONT_FAMILY, 'Roboto Slab', 'Roboto Slab', 'Roboto Slab' ),
					$this->build_responsive_typography_configuration( Typography_Control_Type::FONT_WEIGHT, '400', '400', '400' )
				);
				return $this->append_defaults_per_version( $config, $typography_type );

			case Default_Typography_Type::TEXT:
				$config = array_merge(
					[
						'_id' => $typography_type,
						'title' => esc_html__( 'Text', 'elementor' ),
						self::TYPOGRAPHY_KEY => 'custom',
					],
					$this->build_responsive_typography_configuration( Typography_Control_Type::FONT_FAMILY, 'Roboto', 'Roboto', 'Roboto' ),
					$this->build_responsive_typography_configuration( Typography_Control_Type::FONT_WEIGHT, '400', '400', '400' )
				);
				return $this->append_defaults_per_version( $config, $typography_type );

			case Default_Typography_Type::ACCENT:
				$config = array_merge(
					[
						'_id' => $typography_type,
						'title' => esc_html__( 'Accent', 'elementor' ),
						self::TYPOGRAPHY_KEY => 'custom',
					],
					$this->build_responsive_typography_configuration( Typography_Control_Type::FONT_FAMILY, 'Roboto', 'Roboto', 'Roboto' ),
					$this->build_responsive_typography_configuration( Typography_Control_Type::FONT_WEIGHT, '500', '500', '500' )
				);
				return $this->append_defaults_per_version( $config, $typography_type );

			default:
				return [];
		}

	}

	private function append_defaults_per_version( array $config, $typography_type ) {
		$kit = Plugin::instance()->kits_manager->get_active_kit();
		$version_meta = $kit->get_main_meta( '_elementor_version' );
		if ( version_compare( $version_meta, '3.7', '<' ) ) {
			return $config;
		}
		$zero_px = $this->size_to_px_array( '0' );

		$config = array_merge(
			$config,
			$this->build_responsive_typography_configuration( Typography_Control_Type::TEXT_TRANSFORM, 'none', 'none', 'none' ),
			$this->build_responsive_typography_configuration( Typography_Control_Type::FONT_STYLE, 'normal', 'normal', 'normal' ),
			$this->build_responsive_typography_configuration( Typography_Control_Type::TEXT_DECORATION, 'none', 'none', 'none' ),
			$this->build_responsive_typography_configuration( Typography_Control_Type::LETTER_SPACING, $zero_px, $zero_px, $zero_px ),
			$this->build_responsive_typography_configuration( Typography_Control_Type::WORD_SPACING, $zero_px, $zero_px, $zero_px )
		);

		switch ( $typography_type ) {
			case Default_Typography_Type::PRIMARY:
				$primary_font_size = $this->size_to_px_array( '40' );
				return array_merge(
					$config,
					$this->build_responsive_typography_configuration( Typography_Control_Type::FONT_SIZE, $primary_font_size, $primary_font_size, $primary_font_size ),
					$this->build_responsive_typography_configuration( Typography_Control_Type::LINE_HEIGHT, $primary_font_size, $primary_font_size, $primary_font_size )
				);
			case Default_Typography_Type::SECONDARY:
				$secondary_font_size = $this->size_to_px_array( '30' );
				return array_merge(
					$config,
					$this->build_responsive_typography_configuration( Typography_Control_Type::FONT_SIZE, $secondary_font_size, $secondary_font_size, $secondary_font_size ),
					$this->build_responsive_typography_configuration( Typography_Control_Type::LINE_HEIGHT, $secondary_font_size, $secondary_font_size, $secondary_font_size )
				);
			case Default_Typography_Type::ACCENT:
			case Default_Typography_Type::TEXT:
				$text_font_size = $this->size_to_px_array( '16' );
				return array_merge(
					$config,
					$this->build_responsive_typography_configuration( Typography_Control_Type::FONT_SIZE, $text_font_size, $text_font_size, $text_font_size ),
					$this->build_responsive_typography_configuration( Typography_Control_Type::LINE_HEIGHT, $text_font_size, $text_font_size, $text_font_size )
				);
			default:
				return $config;
		}

	}

	private function size_to_px_array( $size ) {
		return [
			'size' => $size,
			'unit' => 'px',
		];
	}

	public function build_responsive_typography_configuration( $typography_control_type, $desktop_value, $tablet_value, $mobile_value ) {

		$key = self::TYPOGRAPHY_GROUP_PREFIX . $typography_control_type;
		return [
			$key => $desktop_value,
			$key . '_' . Breakpoints_Manager::BREAKPOINT_KEY_MOBILE => $tablet_value,
			$key . '_' . Breakpoints_Manager::BREAKPOINT_KEY_TABLET => $mobile_value,
		];
	}
}

