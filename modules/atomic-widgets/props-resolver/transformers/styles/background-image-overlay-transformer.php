<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Image_Overlay_Transformer extends Transformer_Base {
	public static $DEFAULT_REPEAT = 'repeat';
	public static $DEFAULT_ATTACHMENT = 'scroll';
	public static $DEFAULT_SIZE = 'auto';
	public static $DEFAULT_POSITION = '0% 0%';

	public function transform( $value, Props_Resolver_Context $context ) {
		if ( ! isset( $value['image'] ) ) {
			return '';
		}

		$image_url = $value['image']['src'];


		return Multi_Props::generate( [
			'url' => "url(\" $image_url \")",
			'repeat' => $value['repeat'] ?? self::$DEFAULT_REPEAT,
			'attachment' => $value['attachment'] ?? self::$DEFAULT_ATTACHMENT,
			'size' => $value['size'] ?? self::$DEFAULT_SIZE,
			'position' => $value['position'] ?? self::$DEFAULT_POSITION,
		] );
	}
}
