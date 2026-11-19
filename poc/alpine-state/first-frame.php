<?php

namespace Elementor\Poc\EState;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const SELECTED_CLASS = 'is-selected';
const MAX_CLASS = 'is-max';

function get_php_selectors(): array {
	return [
		'total' => fn ( array $values ) => $values['qty'] * $values['price'],
		'isMax' => fn ( array $values, array $root ) => $values['qty'] >= $root['max'],
	];
}

function compute_derived( array $values, array $root ): array {
	$selectors = get_php_selectors();
	$derived = [];

	foreach ( $root['derived'] as $key => $definition ) {
		$selector = $selectors[ $definition['selector'] ] ?? null;

		if ( $selector ) {
			$derived[ $key ] = $selector( $values, $root );
		}
	}

	return $derived;
}

function apply_initial_presentation( string $html, array $config, array $context ): string {
	$processor = new \WP_HTML_Tag_Processor( $html );

	if ( ! $processor->next_tag() ) {
		return $html;
	}

	$values = $context['values'] ?? [];
	$derived = $context['derived'] ?? [];

	if ( isset( $config['item'] ) && ( $values['selected'] ?? null ) === $config['item'] ) {
		$processor->add_class( SELECTED_CLASS );
	}

	if ( ! empty( $config['root'] ) && isset( $values['qty'] ) ) {
		$processor->set_attribute( 'style', '--e-state-qty:' . (int) $values['qty'] );
	}

	if ( ! empty( $derived['isMax'] ) && ! empty( $config['root'] ) ) {
		$processor->add_class( MAX_CLASS );
	}

	return $processor->get_updated_html();
}
