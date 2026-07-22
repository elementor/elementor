<?php

namespace Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolver_Base;
use Elementor\Modules\Variables\Services\Variables_Service;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Variable_Plain_Resolver extends Plain_Resolver_Base {
	private Variables_Service $variables_service;
	private string $variant_key;

	public function __construct( Variables_Service $variables_service, string $variant_key ) {
		$this->variables_service = $variables_service;
		$this->variant_key = $variant_key;
	}

	public function resolve( $plain_value ) {
		if ( ! is_string( $plain_value ) && ! is_numeric( $plain_value ) ) {
			return null;
		}

		$id_or_label = (string) $plain_value;
		$variable = $this->variables_service->find_by_label_or_id( $id_or_label );

		return [
			'$$type' => $this->variant_key,
			'value' => $variable ? $variable['id'] : $id_or_label,
		];
	}
}
