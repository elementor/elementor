<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Image_Overlay_Transformer extends Transformer_Base {
	private $active_styles = [];

	public function transform( $value, $key ) {
		if ( ! isset( $value['image-src'] ) ) {
			return '';
		}

		$this->add_image_style( $value['image-src'] );

		$this->add_position_and_size_style( $value );

		return $this->build_active_style();
	}

	private function add_image_style( array $image_src ): void {
		$image_url = $this->get_image_url( $image_src );

		$this->active_styles = [];
		$this->active_styles[] = "url(\" $image_url \")";
	}

	private function get_image_url( array $image_src ): string {
		if ( ! empty( $image_src['id'] ) ) {
			return $this->get_image_url_by_id( $image_src['id'] );
		}

		if ( empty( $image_src['url'] ) ) {
			throw new \Exception( 'Invalid image URL.' );
		}

		return $image_src['url'];
	}

	private function get_image_url_by_id( int $id ): string {
		$image_src = wp_get_attachment_image_src(
			(int) $id, 'full'
		);

		if ( ! $image_src ) {
			throw new \Exception( 'Cannot get image src.' );
		}

		[ $image_url ] = $image_src;

		return $image_url;
	}

	private function add_position_and_size_style( array $value ): void {
		if ( ! isset( $value['size'] ) && ! isset( $value['position'] ) ) {
			return;
		}

		if ( ! isset( $value['size'] ) ) {
			$this->active_styles[] = $value['position'];
			return;
		}

		$default_position = '0% 0%';

		$position = $value['position'] ?? $default_position;

		$this->active_styles[] = $position . ' / ' . $value['size'];
	}

	private function build_active_style() {
		return implode( ' ', $this->active_styles );
	}
}