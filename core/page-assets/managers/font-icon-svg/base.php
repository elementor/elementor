<?php
namespace Elementor\Core\Assets\Managers\Font_Icon_Svg;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Font Icon Svg.
 *
 * @since 3.3.0
 */
abstract class Base {
	abstract protected static function get_font_name();

	abstract protected static function get_font_icon_asset_url( $file_name );

	/**
	 * Get font awesome svg.
	 * @param $icon array [ 'value' => string, 'library' => string ]
	 *
	 * @return bool|mixed|string
	 */
	public static function get_font_icon_svg( $icon ) {
		$icon_data = self::get_icon_svg_data( $icon );

		// Add the icon data to the symbols array for later use in page rendering process.
		add_filter( 'elementor/icons_manager/svg_symbols', function( $symbols ) use ( $icon_data, $icon ) {
			if ( ! in_array( $icon_data[ 'key' ], $symbols, TRUE ) ) {
				$symbols[ $icon_data['key'] ] = $icon;
			}

			return $symbols;
		} );

		/**
		 * If in edit mode inline the full svg, otherwise use the symbol.
		 * Will be displayed only after the widget "blur" or page update.
		 */
		if ( Plugin::$instance->editor->is_edit_mode() ) {
			return '<svg xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 ' . $icon_data['width'] . ' ' . $icon_data['height'] . '">
				<path d="' . $icon_data['path'] . '"></path>
			</svg>';
		}

		return '<svg><use xlink:href="#'. $icon_data['key'] .'" /></svg>';
	}

	public static function get_supported_inline_font_icon_family( $icon ) {
		// TODO: Add an array of all supported inline font icons families.
		// TODO: Replace the $icon['value'] to $icon['library'].
		// TODO: Check if need to support font awesome 4.
		// TODO: Check regarding user uploaded font.
		$supported_inline_fonts = [
			[
				'font_family' => 'font_awesome',
				'condition' => preg_match( '/fa(.*) fa-/', $icon['value'] ),
			]
		];

		foreach ( $supported_inline_fonts as $supported_inline_font ) {
			if ( $supported_inline_font['condition'] ) {
				return $supported_inline_font['font_family'];
			}
		}

		return '';
	}

	public static function get_icon_svg_config( $icon ) {
		$icon_key = str_replace( ' fa-', '-', $icon['value'] );  // i.e. 'fab-apple' | 'far-cart'.
		preg_match( '/fa(.*) fa-/', $icon['value'], $matches );
		$icon_name = str_replace( $matches[0], '', $icon['value'] );
		$icon_file_name = str_replace( 'fa-', '', $icon['library'] );
		$icon_file_path = static::get_font_icon_asset_url( $icon_file_name );

		$icon['name'] = $icon_name;

		return [
			'content_type' => 'svg',
			'assets_category' => 'font_awesome',
			'asset_key' => $icon_key,
			'current_version' => 5,
			'asset_path' => $icon_file_path,
			'data' => [
				'file_data_key' => $icon['library'],
			],
			'actions' => [
				'get_svg_data_from_file' => function( $file_data ) use ( $icon ) {
					$icon_name = $icon['name'];

					$svg_data = $file_data['icons'][ $icon_name ];

					return [
						'width' => $svg_data[0],
						'height' => $svg_data[1],
						'path' => $svg_data[4],
					];
				},
			],
		];
	}

	public static function get_icon_svg_data( $icon ) {
		return Plugin::$instance->assets_loader->get_asset_inline_content( self::get_icon_svg_config( $icon ) );
	}
}
