<?php




namespace Elementor\Modules\Optimizer;

require __DIR__ . '/../../vendor/autoload.php';

use WebPConvert\Convert\Exceptions\ConversionFailedException;
use WebPConvert\WebPConvert;
use Sqz\Squeezio;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


class Page_Optimizer {
	private $analyzer_data;
	private $post_id;

	public function __construct( $analyzer_data, $post_id ) {
		$this->analyzer_data = $analyzer_data;
		$this->post_id = $post_id;
		add_filter( 'optimizer_widgets_queue', '__return_empty_array' );
	}

	public function get_analyzer_data( $index ) {
		$index_exists = ( ! ! $index && isset( $this->analyzer_data[ $index ] ) );

		return $index_exists ?
			$this->analyzer_data[ $index ] :
			$index ?
				false :
				$this->analyzer_data;
	}

	public function optimize_page() {
		$images = $this->get_analyzer_data( 'images' );
		$operations_results = [
			'save_placeholders' => false,
		];

		if ( count( $images ) ) {
			// $this->optimize_images( $images );
			$operations_results['save_placeholders'] = $this->save_placeholders();
		}

		return $operations_results;
	}

	public function save_placeholders() {
		$bg_images = $this->get_analyzer_data( 'backgroundImages' );
		$images = $this->get_analyzer_data( 'images' );
		$saved_placeholders = [];

		foreach ( $images as $index => $image ) {
			$saved_placeholders[ $index ] = false;
			$image_id = attachment_url_to_postid( $image['src'] );

			if ( $image_id && $image['placeholder'] ) {
				$placeholder_data = $image['placeholder']['data'];
				$meta_key = '_e_optimizer_placeholder_' . $image['placeholder']['size'];
				$saved_placeholders[ $index ] = add_post_meta( $image_id, $meta_key, $placeholder_data, true );
			}
		}

		foreach ( $bg_images as $index => $image ) {
			$saved_bg_placeholders[ $index ] = false;
			$image_id = attachment_url_to_postid( $image['url'] );

			if ( $image_id && $image['placeholder'] ) {
				$placeholder_data = $image['placeholder']['data'];
				$meta_key = '_e_optimizer_placeholder_' . $image['placeholder']['size'];
				$saved_bg_placeholders[ $index ] = add_post_meta( $image_id, $meta_key, $placeholder_data, true );
			}
		}

		return $saved_placeholders;
	}

	public function optimize_images( $images ) {
		$wp_upload_dir = wp_get_upload_dir();
		foreach ( $images as $image ) {
			$image_url = wp_parse_url( $image['src'] );
			$image_info = pathinfo( $image['src'] );
			$src_path = $this->sanitize_path( str_replace( $wp_upload_dir['baseurl'], $wp_upload_dir['basedir'], $image['src'] ) );
			$destination_path = $src_path . '.webp';
			var_dump( [ $src_path, $destination_path ] );
			try {
				WebPConvert::convert(
					$this->sanitize_path( $src_path ),
					$this->sanitize_path( $destination_path ),
					[
						'quality' => 40,
						'converters' => [ 'cwebp', 'vips', 'imagick', 'gmagick', 'imagemagick', 'graphicsmagick', 'wpc', 'ewww', 'gd' ],
					]
				);
			} catch ( ConversionFailedException $e ) {
				// var_dump( $e );
				$this->squeezio( $this->sanitize_path( $src_path ) );
			}
		}
	}

	public function squeezio( $src_path ) {
		$sqz = Squeezio::getInstance( $src_path );
		$sqz->setSize( 120, 120 )->setQuality( 20 )->exec();
		var_dump( $sqz->getInfos() );
	}

	public function optimize_fonts( $fonts ) {

	}

	public static function remove_nul( $string ) {
		return str_replace( chr( 0 ), '', $string );
	}

	public static function remove_stream_wrappers( $string ) {
		return preg_replace( '#^\\w+://#', '', $string );
	}

	public static function sanitize_path( $string ) {
		$string = self::remove_nul( $string );
		$string = self::remove_stream_wrappers( $string );

		return $string;
	}
}
