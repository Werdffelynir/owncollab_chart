<?php
/**
 * @var OCP\Template $this
 * @var array $_
 */

if(!empty($_['current_user'])):
?>


    <div id="gantt-chart" data-id="<?php p($_['current_user'])?>">
        <div id="loading_page">loading ... </div>
    </div>

    <div id="chart_gantt_zoom">
        <div class="tbl gantt_zoom_line">
            <div class="tbl_cell"> <div id="zoom_min"></div> </div>
            <div class="tbl_cell"><div id="chart_gantt_zoom_slider"></div></div>
            <div class="tbl_cell"> <div id="zoom_plus"></div> </div>
            <div class="tbl_cell"> <div id="zoom_fit_btn"></div> </div>
        </div>
    </div>

<?php endif; ?>
