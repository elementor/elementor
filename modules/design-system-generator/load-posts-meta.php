<?php

namespace Elementor\Modules\Design_System_Generator;

class Load_Posts_Meta {
	public function load() {
		$args = array(
			'post_type'      => 'any', // or 'post', 'page', or your custom post type
			'posts_per_page' => -1,
			'post_status'    => 'publish', // only published posts
			'meta_query'     => array(
				array(
					'key'     => '_elementor_edit_mode',
					'value'   => 'builder',
					'compare' => '=', // indicates it was edited with Elementor
				),
			),
		);
		$query = new \WP_Query($args);

		if ( ! $query->have_posts() ) {
			return [];
		}

		$posts = [];

		foreach ( $query->posts as $post ) {
			$meta_value = $this->asArray( \get_post_meta( $post->ID, '_elementor_data', true ) );

			if ( empty( $meta_value ) ) {
				continue;
			}

			$posts[] = [
				'post_type' => $post->post_type,
				'post_id' => $post->ID,
				'meta_value' => $meta_value,
				'parsed_meta_value' => $this->parse_meta_value( $meta_value ),
			];
		}
		return $posts;
	}

	/**
	 * Parse and transform meta_value data with renamed keys
	 * 
	 * @param array $meta_value The Elementor data array
	 * @return array Transformed array with renamed keys
	 */
	private function parse_meta_value( array $elements ) {
		return array_map( function( $element ) {
			$parsed_element = [];

			foreach ( $element as $key => $value ) {
				if( $key === 'elements' ) {
					$parsed_element[ 'elements' ] = $this->parse_meta_value( $value );
				}
				else if($key === 'settings') {
					foreach($value as $setting_key => $setting_value) {
						$parsed_element['settings'][ $this->transform_keys( $setting_key ) ] = $setting_value;
					}
				}
				else {
					$parsed_element[$key] = $value;
				}
			}

			return $parsed_element;
		}, $elements );
	}

	/**
	 * Transform individual element keys based on mapping configuration
	 * 
	 * @param array $element Single element data
	 * @return array Transformed element with renamed keys
	 */
	private function transform_keys( string $key ) {
		// Check if key contains 'bg' as a standalone word
		if( 
			( $this->find_phrase( 'bg', $key ) || $this->find_phrase( 'background', $key ) ) && 
			$this->find_phrase( 'color', $key )
		 ) {
			return 'background-color';
		}

		if( $this->find_phrase( 'border', $key ) && $this->find_phrase( 'color', $key ) ) {
			return 'border-color';
		}

		if( $this->find_phrase( 'color', $key ) ) {
			return 'color';
		}

		return $key;
	}

	private function find_phrase( string $key, string $string ) {
		 // Build dynamic regex with the word inserted
		 $pattern = '/(\w|)'.$key.'(\w|)/i';
	 
		 return preg_match($pattern, $string) === 1;
	}

	/**
	 * Check if an array contains Elementor elements
	 * 
	 * @param array $array Array to check
	 * @return bool True if array contains elements
	 */
	private function isElementsArray( array $array ) {
		// Check if first item has typical element structure
		if ( empty( $array ) || ! is_array( $array[0] ) ) {
			return false;
		}

		$first_element = $array[0];
		return isset( $first_element['id'] ) || isset( $first_element['elType'] );
	}

	private function asArray( $meta_value ) {
		return json_decode( $meta_value, true );
	}
}