<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Image_Overlay_Transformer extends Transformer_Base {
	public static $default_repeat = 'repeat';
	public static $default_attachment = 'scroll';
	public static $default_size = 'auto';
	public static $default_position = '0% 0%';

	public function transform( $value, Props_Resolver_Context $context ) {
		if ( ! isset( $value['image'] ) ) {
			return '';
		}

		$image_url = $value['image']['src'];

		return Multi_Props::generate( [
			'url' => "url(\" $image_url \")",
			'repeat' => $value['repeat'] ?? self::$default_repeat,
			'attachment' => $value['attachment'] ?? self::$default_attachment,
			'size' => $value['size'] ?? self::$default_size,
			'position' => $value['position'] ?? self::$default_position,
		] );
	}
}
