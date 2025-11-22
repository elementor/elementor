<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Link_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ): ?array {
		$url = $this->extract_url( $value );
		$group = $this->extract_dynamic_tag_group( $value );

		$link_attrs = [
			'href' => $url,
			'target' => $value['isTargetBlank'] ? '_blank' : '_self',
		];

		if ( $group ) {
			$link_attrs['data-dynamic-tag-group'] = $group;
		}

		return array_filter( $link_attrs );
	}

	private function extract_url( $value ): ?string {
		$destination = $value['destination'];
		$post = is_numeric( $destination ) ? get_post( $destination ) : null;

		return $post ? get_permalink( $post ) : $destination;
	}

	private function extract_dynamic_tag_group( $value ): ?string {
		$destination = $value['destination'] ?? null;

		if ( ! is_array( $destination ) || ! isset( $destination['$$type'] ) || 'dynamic' !== $destination['$$type'] ) {
			return null;
		}

		$dynamic_tag_name = $destination['value']['name'] ?? '';

		if ( ! $dynamic_tag_name ) {
			return null;
		}

		$tag_info = \Elementor\Plugin::$instance->dynamic_tags->get_tag_info( $dynamic_tag_name );

		if ( ! $tag_info || ! isset( $tag_info['instance'] ) ) {
			return null;
		}

		$tag_instance = $tag_info['instance'];

		if ( ! method_exists( $tag_instance, 'get_group' ) ) {
			return null;
		}

		$tag_group = $tag_instance->get_group();

		if ( 'contact-url' === $dynamic_tag_name && 'action' === $tag_group ) {
			return 'site';
		}

		return $tag_group;
	}
}
