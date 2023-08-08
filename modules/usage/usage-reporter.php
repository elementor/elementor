<?php
namespace Elementor\Modules\Usage;

use Elementor\Modules\System_Info\Reporters\Base;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor usage report.
 *
 * Elementor system report handler class responsible for generating a report for
 * the user.
 */
class Usage_Reporter extends Base {

	const RECALC_ACTION = 'elementor_usage_recalc';

	public function get_title() {
		return esc_html__( 'Elements Usage', 'elementor' );
	}

	public function get_fields() {
		return [
			'usage' => '',
		];
	}

	public function print_html_label( $label ) {
		$title = $this->get_title();

		if ( empty( $_GET[ self::RECALC_ACTION ] ) ) { // phpcs:ignore -- nonce validation is not required here.
			$nonce = wp_create_nonce( self::RECALC_ACTION );
			$url = add_query_arg( [
				self::RECALC_ACTION => 1,
				'_wpnonce' => $nonce,
			] );

			$title .= '<a id="elementor-usage-recalc" href="' . esc_url( $url ) . '#elementor-usage-recalc" class="box-title-tool">' . esc_html__( 'Recalculate', 'elementor' ) . '</a>';
		} else {
			$title .= $this->get_remove_recalc_query_string_script();
		}

		parent::print_html_label( $title );
	}

	public function get_usage() {
		/** @var Module $module */
		$module = Module::instance();

		if ( ! empty( $_GET[ self::RECALC_ACTION ] ) ) {
			// phpcs:ignore
			$nonce = Utils::get_super_global_value( $_GET, '_wpnonce' );

			if ( ! wp_verify_nonce( $nonce, self::RECALC_ACTION ) ) {
				wp_die( 'Invalid Nonce', 'Invalid Nonce', [
					'back_link' => true,
				] );
			}

			$module->recalc_usage();
		}

		$usage = '';

		foreach ( $module->get_formatted_usage() as $doc_type => $data ) {
			$usage .= '<tr><td>' . $data['title'] . ' ( ' . $data['count'] . ' )</td><td>';

			foreach ( $data['elements'] as $element => $count ) {
				$usage .= $element . ': ' . $count . PHP_EOL;
			}

			$usage .= '</td></tr>';
		}

		$usage .= '<tr><td colspan="2">' . $this->get_insights( $module->get_formatted_usage() ) . '</td></tr>';

		return [
			'value' => $usage,
		];
	}

	public function get_raw_usage() {
		/** @var Module $module */
		$module = Module::instance();
		$usage = PHP_EOL;

		foreach ( $module->get_formatted_usage( 'raw' ) as $doc_type => $data ) {
			$usage .= "\t{$data['title']} : " . $data['count'] . PHP_EOL;

			foreach ( $data['elements'] as $element => $count ) {
				$usage .= "\t\t{$element} : {$count}" . PHP_EOL;
			}
		}

		return [
			'value' => $usage,
		];
	}

	/**
	 * Removes the "elementor_usage_recalc" param from the query string to avoid recalc every refresh.
	 * When using a redirect header in place of this approach it throws an error because some components have already output some content.
	 *
	 * @return string
	 */
	private function get_remove_recalc_query_string_script() {
		ob_start();
		?>
		<script>
			// Origin file: modules/usage/usage-reporter.php - get_remove_recalc_query_string_script()
			{
				const url = new URL( window.location );

				url.hash = '';
				url.searchParams.delete( 'elementor_usage_recalc' );
				url.searchParams.delete( '_wpnonce' );

				history.replaceState( '', window.title, url.toString() );
			}
		</script>
		<?php

		return ob_get_clean();
	}

	private function get_insights( $insights ) {
		$documents = [];
		$widgets = [];
		$max_per_document = 0;
		$max_per_widget = 0;

		foreach ( $insights as $doc_type => $data ) {
			$documents[ $data['title'] ] = $data['count'];
			$max_per_document = max( $max_per_document, $data['count'] );

			foreach ( $data['elements'] as $element => $count ) {
				if ( isset( $widgets[ $element ] ) ) {
					$widgets[ $element ] += $count;
				} else {
					$widgets[ $element ] = $count;
				}
				$max_per_widget = max( $max_per_widget, $widgets[ $element ] );
			}
		}

		arsort( $documents );
		arsort( $widgets );

		ob_start();
		?>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/charts.css@0.9.0/dist/charts.min.css">

		<style>
		.charts-css {
			direction: ltr;
			max-width: 100%;
			height: unset;
			--heading-size: 3rem;
		}
		.charts-css caption {
			text-align: start;
			padding-block-end: 40px !important;
		}
		.charts-css tbody tr {
			transition-duration: 0.3s;
			height: 1.75rem;
		}
		.charts-css tbody tr:hover {
			background-color: rgba(0, 0, 0, 0.1);
		}
		.charts-css tbody > tr:nth-child(odd) > td,
		.charts-css tbody > tr:nth-child(odd) > th {
			background-color: transparent;
		}
		.charts-css tbody tr th {
			align-items: flex-start !important;
			background-color: transparent;
			font-size: smaller;
		}
		.charts-css tbody tr th span span {
			font-weight: normal;
			font-size: smaller;
		}
		#stats-by-documents {
			--color: #192;
			--labels-size: 150px;
		}
		#stats-by-elements {
			--color: #36C;
			--labels-size: 150px;
		}
		</style>

		<table class="charts-css bar show-heading show-labels show-primary-axis show-3-secondary-axes data-spacing-2 hide-data" id="stats-by-documents">
			<caption> <?php echo esc_html__( 'Elementor usage stats by documents', 'elementor' ); ?> </caption>
			<thead>
				<tr>
					<th scope="col"> <?php echo esc_html__( 'Document', 'elementor' ); ?> </th>
					<th scope="col"> <?php echo esc_html__( 'Count', 'elementor' ); ?> </th>
				</tr>
			</thead>
			<tbody>
			<?php foreach ( $documents as $name => $count ) { ?>
				<tr>
					<th>
						<span> <?php echo esc_html( $name ); ?> <span>(<?php echo esc_html( $count ); ?>)</span></span>
					</th>
					<td style="--size: calc( <?php echo esc_attr( $count ); ?> / <?php echo esc_attr( $max_per_document ); ?> );">
						<span class="data"><?php echo esc_html( $count ); ?></span>
					</td>
				</tr>
			<?php } ?>
			</tbody>
		</table>

		<table class="charts-css bar show-heading show-labels show-primary-axis show-3-secondary-axes data-spacing-2 hide-data" id="stats-by-elements">
			<caption> <?php echo esc_html__( 'Elementor usage stats by elements', 'elementor' ); ?> </caption>
			<thead>
				<tr>
					<th scope="col"> <?php echo esc_html__( 'Element', 'elementor' ); ?> </th>
					<th scope="col"> <?php echo esc_html__( 'Count', 'elementor' ); ?> </th>
				</tr>
			</thead>
			<tbody>
			<?php foreach ( $widgets as $name => $count ) { ?>
				<tr>
					<th>
						<span> <?php echo esc_html( $name ); ?> <span>(<?php echo esc_html( $count ); ?>)</span></span>
					</th>
					<td style="--size: calc( <?php echo esc_attr( $count ); ?> / <?php echo esc_attr( $max_per_widget ); ?> );">
						<span class="data"><?php echo esc_html( $count ); ?></span>
					</td>
				</tr>
			<?php } ?>
			</tbody>
		</table>

		<?php
		return ob_get_clean();
	}
}
