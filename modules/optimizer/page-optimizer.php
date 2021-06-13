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

	public function optimize() {
		$images = $this->analyzer_data['images'];
		$bg_images = $this->analyzer_data['backgroundImages'];
		$operations_results = [];

		if ( count( $images ) ) {
			// $this->optimize_images( $images );
			$operations_results['save_images_placeholders'] = $this->save_placeholders();
		}

		if ( count( $bg_images ) ) {
			// $this->optimize_images( $images );
			$operations_results['save_bg_images_placeholders'] = $this->save_placeholders( true );
		}

		if ( $this->analyzer_data ) {
			$operations_results['save_analyzer_report'] = $this->save_analyzer_report();
		}

		return $operations_results;
	}

	public function save_analyzer_report() {
		if ( get_post_meta( $this->post_id, '_elementor_analyzer_report', true ) ) {
			return update_post_meta( $this->post_id, '_elementor_analyzer_report', $this->analyzer_data );
		} else {
			return add_post_meta( $this->post_id, '_elementor_analyzer_report', $this->analyzer_data, true );
		}
	}

	public function save_placeholders( $background_images = false ) {
		$images_data_key = $background_images ? 'backgroundImages' : 'images';
		$images = $this->analyzer_data[ $images_data_key ];
		$saved_placeholders = [];

		foreach ( $images as $index => $image ) {
			$saved_placeholders[ $index ] = false;
			$url_key = $background_images ? $image['url'] : $image['src'];
			$image_id = attachment_url_to_postid( $url_key );

			if ( $image_id && $image['placeholder'] ) {
				$images[ $index ][ 'id' ] = $image_id;
				$meta_key = '_e_optimizer_placeholder_' . $image['placeholder']['size'];
				$saved_placeholders[ $index ] =
					add_post_meta( $image_id, $meta_key, $image['placeholder']['data'], true );
			}
		}

		$this->analyzer_data[ $images_data_key ] = $images;

		return [ $saved_placeholders ];
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

	private function save_images( $images ) {
		$wp_upload_dir = wp_get_upload_dir();
		foreach ( $images as $key => $image ) {
			$url_key = isset( $image['url'] ) ? $image['url'] : $image['src'];
			$src_path = str_replace( $wp_upload_dir['baseurl'], $wp_upload_dir['basedir'], $url_key );
			$destination_path = $src_path . '-' . $image['optimized']['size'] . '.webp';
			/*
						$image_id = attachment_url_to_postid( $url_key );

						if ( $image_id ) {
							$post_meta_key = '_e_optimizer_image_size_' . $image['optimized']['size'];
							if ( ! get_post_meta( $image_id, $post_meta_key, true ) ) {
								update_post_meta( $image_id, $post_meta_key, true );
							}
						}
			*/
			file_put_contents( $destination_path, file_get_contents( $image['optimized']['data'] ) );
			unset( $images[ $key ]['optimized']['data'] );
		}

		return $images;
	}

	public function save_optimized_images( $optimized_images ) {
		$page_data = get_post_meta( $this->post_id, '_elementor_analyzer_report', true );
		foreach ( [ 'images', 'backgroundImages' ] as $group ) {
			if ( isset( $optimized_images[ $group ] ) &&
			     is_array( $optimized_images[ $group ] ) &&
			     count( $optimized_images[ $group ] ) ) {
				$page_data[ $group ] = $this->save_images( $optimized_images[ $group ] );
			}
		}

		update_post_meta( $this->post_id, '_elementor_analyzer_report', $page_data );

		wp_send_json_success( [ $optimized_images ], 200 );
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
