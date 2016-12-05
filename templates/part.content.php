<?php
/**
 * @var OCP\Template $this
 * @var array $_
 */
$current_user = !empty($_['current_user']) ? !empty($_['current_user']) : null;
if(!empty($_['current_user'])):
?>
<?php endif; ?>

    <div id="gantt-chart" data-id="<?php p($current_user)?>">
        <div id="loading_page"><?php p($l->t('loading'));?> ... </div>
    </div>

    <div id="chart_gantt_zoom">
        <div class="tbl gantt_zoom_line">
            <div class="tbl_cell"> <div id="zoom_min"></div> </div>
            <div class="tbl_cell"><div id="chart_gantt_zoom_slider"></div></div>
            <div class="tbl_cell"> <div id="zoom_plus"></div> </div>
            <div class="tbl_cell"> <div id="zoom_fit_btn"></div> </div>
        </div>
    </div>


