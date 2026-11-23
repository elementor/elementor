<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Modules\Agents\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dashboard_Overview_Block {

	const HOOK = 'elementor/admin/dashboard_overview_widget/after_header';

	const STATE_NOT_SCANNED = 'not_scanned';
	const STATE_NEEDS_WORK = 'needs_work';
	const STATE_GETTING_THERE = 'getting_there';
	const STATE_STRONG = 'strong';

	const STATE_BY_TIER = [
		Score_Tiers::TIER_LOW => self::STATE_NEEDS_WORK,
		Score_Tiers::TIER_MID => self::STATE_GETTING_THERE,
		Score_Tiers::TIER_HIGH => self::STATE_STRONG,
	];

	const FAILING_CHECK_STATUSES = [ 'fail', 'partial' ];

	private Scanner_Report_Store $scanner_store;

	public function __construct( Scanner_Report_Store $scanner_store ) {
		$this->scanner_store = $scanner_store;
	}

	public function register(): void {
		add_action( self::HOOK, [ $this, 'render' ] );
	}

	public function should_render(): bool {
		return current_user_can( 'manage_options' );
	}

	public function get_state(): string {
		$score = $this->get_score( $this->scanner_store->get_last_report() );

		if ( null === $score ) {
			return self::STATE_NOT_SCANNED;
		}

		return self::STATE_BY_TIER[ Score_Tiers::get_tier( $score ) ];
	}

	public function get_score( ?array $report ): ?int {
		$score = $report['score'] ?? null;

		if ( ! is_numeric( $score ) ) {
			return null;
		}

		return (int) round( min( max( (float) $score, 0 ), Score_Tiers::SCORE_MAX ) );
	}

	public function get_fixes_count( ?array $report ): int {
		$checks = is_array( $report['checks'] ?? null ) ? $report['checks'] : [];

		$failing_checks = array_filter(
			$checks,
			fn( $check ) => is_array( $check ) && in_array( $check['status'] ?? null, self::FAILING_CHECK_STATUSES, true )
		);

		return count( $failing_checks );
	}

	public function get_cta_url(): string {
		return admin_url( 'admin.php?page=' . Module::PAGE_ID );
	}

	public function render(): void {
		if ( ! $this->should_render() ) {
			return;
		}

		$report = $this->scanner_store->get_last_report();
		$state = $this->get_state();
		$score = $this->get_score( $report );
		$fixes_count = $this->get_fixes_count( $report );
		?>
		<div class="e-overview__agent-ready e-overview__agent-ready--<?php echo esc_attr( $state ); ?>">
			<div class="e-overview__agent-ready-card">
				<div class="e-overview__agent-ready-title-row">
					<span class="e-overview__badge"><?php echo esc_html__( 'New', 'elementor' ); ?></span>
					<h3 class="e-overview__agent-ready-title"><?php echo esc_html__( 'Agent Readiness', 'elementor' ); ?></h3>
				</div>
				<?php if ( self::STATE_NOT_SCANNED === $state ) { ?>
					<p class="e-overview__agent-ready-text"><?php echo esc_html( $this->get_title( $state, $score ) ); ?></p>
				<?php } else { ?>
					<div class="e-overview__agent-ready-status">
						<span class="e-overview__agent-ready-dot" aria-hidden="true"></span>
						<p class="e-overview__agent-ready-text"><?php echo esc_html( $this->get_title( $state, $score ) ); ?></p>
					</div>
				<?php } ?>
				<div class="e-overview__agent-ready-actions">
					<?php if ( $fixes_count > 0 && self::STATE_STRONG !== $state ) { ?>
						<span class="e-overview__agent-ready-meta"><?php echo esc_html( $this->get_fixes_label( $fixes_count ) ); ?></span>
					<?php } ?>
					<a href="<?php echo esc_url( $this->get_cta_url() ); ?>" class="button" data-agent-ready-cta="<?php echo esc_attr( $state ); ?>"><?php echo esc_html( $this->get_cta_label( $state ) ); ?></a>
				</div>
			</div>
		</div>
		<?php
	}

	private function get_title( string $state, ?int $score ): string {
		if ( self::STATE_NOT_SCANNED === $state ) {
			return __( 'Your site might not be visible to AI agents.', 'elementor' );
		}

		return sprintf(
			/* translators: 1: Readiness score, 2: Score label such as "Strong". */
			__( '%1$d/100 · %2$s', 'elementor' ),
			$score,
			$this->get_state_label( $state )
		);
	}

	private function get_state_label( string $state ): string {
		$labels = [
			self::STATE_NEEDS_WORK => __( 'Needs work', 'elementor' ),
			self::STATE_GETTING_THERE => __( 'Getting there', 'elementor' ),
			self::STATE_STRONG => __( 'Strong', 'elementor' ),
		];

		return $labels[ $state ] ?? '';
	}

	private function get_fixes_label( int $fixes_count ): string {
		return sprintf(
			/* translators: %d: Number of fixes. */
			_n( '%d quick fix', '%d quick fixes', $fixes_count, 'elementor' ),
			$fixes_count
		);
	}

	private function get_cta_label( string $state ): string {
		$labels = [
			self::STATE_NOT_SCANNED => __( 'Scan & Fix', 'elementor' ),
			self::STATE_NEEDS_WORK => __( 'Fix now', 'elementor' ),
			self::STATE_GETTING_THERE => __( 'Fix now', 'elementor' ),
			self::STATE_STRONG => __( 'View report', 'elementor' ),
		];

		return $labels[ $state ];
	}
}
