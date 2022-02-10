<?php
namespace Elementor\Modules\Fontsource;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager;
use Elementor\Fonts;
use Elementor\Plugin;

class Module extends BaseModule {

	public function get_name() {
		return 'fontsource';
	}

	public static function get_experimental_data() {
		return [
			'name' => 'e_self_hosted_google_fonts',
			'title' => esc_html__( 'Self-hosted Google Fonts', 'elementor' ),
			'description' => esc_html__( 'The Google Fonts library is now self-hosted. You can now use the fonts you like from your WordPress site.', 'elementor' )
			                 . ' <a href="https://go.elementor.com/wp-dash-self-hosted-google-fonts" target="_blank">'
			                 . esc_html__( 'Learn More', 'elementor' ) . '</a>',
			'release_status' => Manager::RELEASE_STATUS_ALPHA,
			'default' => Manager::STATE_INACTIVE,
		];
	}

	public function __construct() {
		parent::__construct();

		$is_experiment_active = Plugin::$instance->experiments->is_feature_active( 'e_self_hosted_google_fonts' );
		if ( ! $is_experiment_active ) {
			return;
		}

		add_filter( 'elementor/frontend/print_google_fonts', '__return_false' );

		add_action( 'elementor/frontend/after_enqueue_scripts', [ $this, 'enqueue_google_fonts' ] );
	}

	public function enqueue_google_fonts() {
		$google_fonts = Plugin::$instance->frontend->fonts_to_enqueue;

		if ( empty( $google_fonts ) ) {
			return;
		}

		foreach ( $google_fonts as $key => $font ) {

			$font_type = Fonts::get_font_type( $font );

			if ( Fonts::GOOGLE !== $font_type ) {
				continue;
			}
			var_dump( $font );

			$local_font_data = $this->get_font( $font );

			// var_dump( $font_url );
			var_dump( $local_font_data[ 1 ] );
		}
	}


	const FONTSOURCE_API = 'https://api.fontsource.org/v1/fonts/';

	private static function sanitize_font_name( $font_name ) {
		// Lowercase and remove spaces.
		$font_name = strtolower( $font_name );
		$font_name = preg_replace( '/\s+/', '-', $font_name );

		return $font_name;
	}

	public static function retrieve_fontsource_data( $font_name ) {
		$font_name = self::sanitize_font_name( $font_name );

		$response = wp_remote_get( self::FONTSOURCE_API . $font_name );
		if ( is_wp_error( $response ) ) {
			return false;
		}

		$response_body = wp_remote_retrieve_body( $response );
		if ( empty( $response_body ) ) {
			return false;
		}

		$response_body = json_decode( $response_body, true );
		if ( empty( $response_body ) ) {
			return false;
		}

		return $response_body;
	}


	/**
	 * Get font remote url.
	 * @return string|false
	 * @since 3.6.0
	 * @access public
	 * @static
	 *
	 * @param int $weight The font weight.
	 * @param string $style The font style.
	 * @param string $subset The font subset.
	 */
	public static function get_remote_font_url( $data, $weight = 400, $style = 'normal', $subset = null ) {
		if ( ! $subset ) {
			$subset = $data[ 'defSubset' ];
		}

		if ( ! in_array( $subset, $data[ 'subsets' ] )
		     || ! in_array( $weight, $data[ 'weights' ] )
		     || ! in_array( $style, $data[ 'styles' ] ) ) {
			return false;
		}

		$variants = $data[ 'variants' ];
		$font_url = $variants[ $weight ][ $style ][ $subset ][ 'url' ][ 'woff2' ];

		return $font_url;
	}

	/**
	 * Download font.
	 * @return array|bool The font file path or false if the font could not be downloaded.
	 * @since 3.6.0
	 * @access public
	 *
	 * @param string $font_name The font name.
	 * @param int $weight The font weight.
	 * @param string $style The font style.
	 * @param string $subset The font subset.
	 */
	public static function get_font( $font_name, $weight = 400, $style = 'normal', $subset = null ) {
		$data = self::retrieve_fontsource_data( $font_name );
		if ( ! $data ) {
			return false;
		}

		$remote_font_url = self::get_remote_font_url( $data, $weight, $style, $subset );
		if ( ! $remote_font_url ) {
			return false;
		}

		$font_file_path = self::get_font_file_path( $remote_font_url );

		if ( ! file_exists( $font_file_path ) ) {
			$response = wp_remote_get( $remote_font_url );
			if ( is_wp_error( $response ) ) {
				return false;
			}

			$response_body = wp_remote_retrieve_body( $response );
			if ( empty( $response_body ) ) {
				return false;
			}

			// Create the directory if it doesn't exist
			$dir = dirname( $font_file_path );
			if ( ! is_dir( $dir ) ) {
				wp_mkdir_p( $dir );
			}

			// Save the file
			$file_saved = file_put_contents( $font_file_path, $response_body );
			if ( ! $file_saved ) {
				return false;
			}
		}

		$local_font_url = self::get_local_font_url( $font_file_path );
		$css_declaration = self::get_css_font_face_declaration( $data, $weight, $style, $subset, $local_font_url );

		return [ $local_font_url,  $css_declaration ];
	}

	/**
	 * Get font file path.
	 * @return string
	 * @since 3.6.0
	 * @access private
	 * @static
	 *
	 * @param string $url The remote url of the font.
	 */
	private static function get_font_file_path( $url ) {
		$wp_upload_dir = wp_upload_dir();

		$fontsource_dir = implode( DIRECTORY_SEPARATOR, [ $wp_upload_dir['basedir'], 'elementor', 'fonts' ] );
		$file_name = basename( $url );

		return implode( DIRECTORY_SEPARATOR, [ $fontsource_dir, $file_name ] );
	}

	/**
	 * Get font file url.
	 * @return string The font file url.
	 * @since 3.6.0
	 * @access public
	 *
	 * @param string $file_path.
	 */
	public static function get_local_font_url( $file_path ) {
		$wp_upload_dir = wp_upload_dir();
		$fontsource_dir = implode( '/', [ $wp_upload_dir['baseurl'], 'elementor', 'fonts' ] );
		return implode( '/', [ $fontsource_dir, basename( $file_path ) ] );
	}

	/**
	 * Get CSS font face declaration.
	 * @return string The CSS font face declaration.
	 * @since 3.6.0
	 * @access public
	 * @static
	 *
	 * @param array $data The fontsource data.
	 * @param int $weight The font weight.
	 * @param string $style The font style.
	 * @param string $subset The font subset.
	 * @param string $font_file_url The font file url.
	 */

	public static function get_css_font_face_declaration( $data, $weight, $style, $subset, $font_file_url ) {
		$unicode_range = self::get_unicode_range( $data, $subset );

		$css = '@font-face {';
		$css .= 'font-family: ' . $data[ 'family' ] . ';';
		$css .= 'src: url(\'' . $font_file_url . '\');';
		$css .= 'font-weight: ' . $weight . ';';
		$css .= 'font-style: ' . $style . ';';
		$css .= $unicode_range ? 'unicode-range: \'' . $unicode_range . '\';' : '';
		$css .= '}';

		return $css;
	}

	private static function get_unicode_range( $data, $subset ) {
		if ( ! $subset ) {
			$subset = $data[ 'defSubset' ];
		}

		$available_subsets = $data[ 'subsets' ];
		if ( ! in_array( $subset, $available_subsets ) ) {
			return false;
		}

		return $data[ 'unicodeRange' ][ $subset ];
	}
}
