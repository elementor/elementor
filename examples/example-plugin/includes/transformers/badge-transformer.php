<?php
namespace Elementor_Example_Plugin\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Badge_Transformer extends Transformer_Base {

	private const LABELS = [
		'new' => 'New',
		'featured' => 'Featured',
		'sale' => 'Sale',
	];

	public function transform( $value, Props_Resolver_Context $context ) {
		return self::LABELS[ $value ] ?? $value;
	}
}
