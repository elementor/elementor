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

		add_action( 'elementor/frontend/before_print_google_fonts', [ $this, 'enqueue_google_fonts' ], 10, 1 );
	}

	public function enqueue_google_fonts( $fonts ) {
		if ( empty( $fonts ) ) {
			return;
		}

		$google_fonts = [];

		if ( ! isset( $fonts['google'] ) ) {
			return;
		}

		$google_fonts = $fonts['google'];

		if ( ! is_array( $google_fonts ) || ! count( $google_fonts ) ) {
			return;
		}

		$css = '';
		$subset_vars = [];

		foreach ( $google_fonts as $key => $font ) {
			$font_data = $this->retrieve_fontsource_data( $font );
			$subsets = $this->get_required_subsets( $font_data );
			$weights =  $font_data['weights'];
			$styles = $font_data['styles'];
			$slug = $this->get_font_slug( $font_data, $subsets, $weights, $styles );

			$css_from_cache = get_transient( $slug );

			if ( false === $css_from_cache ) {
				$css_from_cache = $this->generate_font_css( $font_data, $subsets, $weights, $styles, $subset_vars );
				set_transient( $slug, $css_from_cache, DAY_IN_SECONDS );
			}

			$css .= $css_from_cache[0];
			$subset_vars = $css_from_cache[1];
		}

		$css = ':root{' . implode( '', $subset_vars ) . '}' . $css;
		echo '<style class="e-self-hosted-google-fonts">' . $css . '</style>';
	}

	private static function get_font_slug( $font_data, $subsets, $weights, $styles ) {
		$slug = $font_data['id'];
		foreach ( $subsets as $subset ) {
			$slug .= '-' . $subset;
		}
		foreach ( $weights as $weight ) {
			$slug .= '-' . $weight;
		}
		foreach ( $styles as $style ) {
			$slug .= '-' . $style;
		}
		return $slug;
	}

	private static function get_required_subsets( $data ) {
		$required_subsets = [];

		$required_subsets[] = $data['defSubset'];

		$subsets = [
			'ru_RU' => 'cyrillic',
			'bg_BG' => 'cyrillic',
			'he_IL' => 'hebrew',
			'el' => 'greek',
			'vi' => 'vietnamese',
			'uk' => 'cyrillic',
			'cs_CZ' => 'latin-ext',
			'ro_RO' => 'latin-ext',
			'pl_PL' => 'latin-ext',
			'hr_HR' => 'latin-ext',
			'hu_HU' => 'latin-ext',
			'sk_SK' => 'latin-ext',
			'tr_TR' => 'latin-ext',
			'lt_LT' => 'latin-ext',
		];

		/**
		 * Google font subsets.
		 *
		 * Filters the list of Google font subsets from which locale will be enqueued in frontend.
		 *
		 * @since 1.0.0
		 *
		 * @param array $subsets A list of font subsets.
		 */
		$subsets = apply_filters( 'elementor/frontend/google_font_subsets', $subsets );

		$locale = get_locale();

		if ( isset( $subsets[ $locale ] ) && ! in_array( $subsets[ $locale ], $required_subsets ) ) {
			$required_subsets[] = $subsets[ $locale ];
		}

		return $required_subsets;
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

		$data = get_transient( 'e_fontsource_' . $font_name );

		if ( false !== $data ) {
			return json_decode( $data, true );
		}

		$response = wp_remote_get( self::FONTSOURCE_API . $font_name );
		if ( is_wp_error( $response ) ) {
			return false;
		}

		$data = wp_remote_retrieve_body( $response );
		if ( empty( $data ) ) {
			return false;
		}

		set_transient( 'e_fontsource_' . $font_name, $data, WEEK_IN_SECONDS );

		return json_decode( $data, true );
	}

	private static function download_font( $remote_font_url, $font_file_path ) {
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
			$font_file_path = self::download_font( $remote_font_url, $font_file_path );
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
		$css = '@font-face {';
		$css .= 'font-family: ' . $data[ 'family' ] . ';';
		$css .= 'src: url(\'' . $font_file_url . '\');';
		$css .= 'font-weight: ' . $weight . ';';
		$css .= 'font-style: ' . $style . ';';
		$css .= 'unicode-range: var(--'. $data['id'] .'-' . $subset . '-unicode-range);';
		$css .= '}';

		return $css;
	}

	private static function get_unicode_range( $data, $subset ) {
		if ( ! in_array( $subset, $data[ 'subsets' ] ) ) {
			return false;
		}

		return $data[ 'unicodeRange' ][ $subset ];
	}

	private function generate_font_css( $font_data, array $subsets, $weights, $styles, $subset_vars ) {
		$font = $font_data['id'];
		$css = '';

		foreach ( $subsets as $subset ) {
			$unicode_range = $this->get_unicode_range( $font_data, $subset );
			$subset_var = '--' . $font . '-' . $subset . '-unicode-range: ';
			$subset_var .= '\'' . $unicode_range . '\'' . ';';
			$subset_vars[] = $subset_var;

			foreach ( $weights as $weight ) {
				foreach ( $styles as $style ) {
					$local_font = $this->get_font( $font, $weight, $style, $subset );
					$css .= $local_font[1];
				}
			}
		}

		return [ $css, $subset_vars ];
	}
}
