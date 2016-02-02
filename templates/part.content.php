<?php
/**
 * @var OCP\Template $this
 * @var array $_
 */

?>

    <div id="chart_gantt_visual" data-id="<?php p($_['id'])?>" style=" width:100%; height:100%;"></div>

    <div id="chart_gantt_zoom">
        <div class="tbl gantt_zoom_line">
            <div class="tbl_cell">-</div>
            <div class="tbl_cell"><div id="chart_gantt_zoom_slider"></div></div>
            <div class="tbl_cell">+</div>
            <div class="tbl_cell"> <div id="zoom_fit_btn">fit</div> </div>
        </div>
    </div>
