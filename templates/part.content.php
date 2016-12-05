<?php
/**
 * @var OCP\Template $this
 * @var array $_
 */
$current_user = !empty($_['current_user']) ? !empty($_['current_user']) : null;
$is_admin = !empty($_['is_admin']) ? !empty($_['is_admin']) : false;

$add_css_class = !$is_admin ? 'gantt-chart-public-size' : '';
?>

    <div id="gantt-chart" data-id="<?php p($current_user)?>" class="<?php p($add_css_class)?>">
        <div id="loading_page"><?php p($l->t('loading'));?>... </div>

    </div>

    <div id="chart_gantt_zoom">
        <div class="tbl gantt_zoom_line">
            <div class="tbl_cell"> <div id="zoom_min"></div> </div>
            <div class="tbl_cell"><div id="chart_gantt_zoom_slider"></div></div>
            <div class="tbl_cell"> <div id="zoom_plus"></div> </div>
            <div class="tbl_cell"> <div id="zoom_fit_btn"></div> </div>
        </div>
    </div>


