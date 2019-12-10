<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @var array $reports
 * @var array $required_plugins_properties
 * @var int   $tabs_count
 */

$tabs_count++;

$required_plugins_properties = array_flip( $required_plugins_properties );

unset( $required_plugins_properties['Name'] );

foreach ( $reports as $report_name => $report ) :
	$indent = str_repeat( "\t", $tabs_count - 1 );

	$is_plugins = in_array( $report_name, [
		'plugins',
		'network_plugins',
		'mu_plugins',
	] );

	if ( ! $is_plugins ) :
		echo PHP_EOL . $indent . '== ' . $report['label'] . ' ==';
	endif;

	echo PHP_EOL;

	foreach ( $report['report'] as $field_name => $field ) :
		$sub_indent = str_repeat( "\t", $tabs_count );

		if ( $is_plugins ) {
			echo "== {$field['label']} ==" . PHP_EOL;

			foreach ( $field['value'] as $plugin_info ) :
				$plugin_properties = array_intersect_key( $plugin_info, $required_plugins_properties );

				echo $sub_indent . $plugin_info['Name'];

				foreach ( $plugin_properties as $property_name => $property ) :
					echo PHP_EOL . "{$sub_indent}\t{$property_name}: {$property}";
				endforeach;

				echo PHP_EOL . PHP_EOL;
			endforeach;
		} else {
			$label = $field['label'];

			if ( ! empty( $label ) ) {
				$label .= ': ';
			}
			echo "{$sub_indent}{$label}{$field['value']}" . PHP_EOL;
		}
	endforeach;

	if ( ! empty( $report['sub'] ) ) :
		$this->print_report( $report['sub'], $template, true );
	endif;
endforeach;

$tabs_count--;
