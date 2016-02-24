<?php
/**
 * @var OCP\Template $this
 * @var array $_
 */

$appName = 'owncollab_chart';
?>

<div class="tbl">
    <div class="tbl_cell export_gantt export_excel">

            <h4>Excel</h4>
            <img src="<?php p($this->image_path($appName,'ms_excel.png'))?>" alt="">

    </div>
    <div class="tbl_cell export_gantt export_pdf">

            <h4>PDF</h4>
            <img src="<?php p($this->image_path($appName,'application-pdf.png'))?>" alt="">

    </div>
    <div class="tbl_cell export_gantt export_img">

            <h4>Image</h4>
            <img src="<?php p($this->image_path($appName,'image.png'))?>" alt="">

    </div>
    <div class="tbl_cell export_gantt export_ical">

            <h4>iCalendar</h4>
            <img src="<?php p($this->image_path($appName,'ical.png'))?>" alt="">

    </div>
    <div class="tbl_cell export_gantt export_mc">

            <h4>MS Project</h4>
            <img src="<?php p($this->image_path($appName,'ms_project.png'))?>" alt="">

    </div>
</div>

<div id="sidebar-export-pdf" style="display: none">

    <div class="sidebar_line"><div class="sidebar_line_arrow"></div></div>

    <p>Define period to export</p>

    <div class="tbl">
        <div class="tbl_cell"><span>Start</span> <input type="text"></div>
        <div class="tbl_cell"><span>End</span> <input type="text"></div>
    </div>

    <div class="tbl">
        <div class="tbl_cell">Paper size</div>
        <div class="tbl_cell">
            <select name="paper_size" id="">
                <option value="1">A4 - 21 x 29.7 cm</option>
                <option value="2">A4 - 21 x 29.7 cm</option>
            </select>
        </div>
    </div>

    <div class="tbl">
        <div class="tbl_cell">Orientation</div>
        <div class="tbl_cell">
            <select name="paper_size" id="">
                <option value="1">Portrait</option>
                <option value="1">Albom</option>
            </select>
        </div>
    </div>

    <p>Define Header</p>

    <div class="tbl">
        <div class="tbl_cell">Left</div>
        <div class="tbl_cell"><input type="text"></div>
    </div>

    <div class="tbl">
        <div class="tbl_cell">Center</div>
        <div class="tbl_cell"><input type="text"></div>
    </div>

    <div class="tbl">
        <div class="tbl_cell">Right</div>
        <div class="tbl_cell"><input type="text"></div>
    </div>


    <p>Define Footer</p>

    <div class="tbl">
        <div class="tbl_cell">Left</div>
        <div class="tbl_cell"><input type="text"></div>
    </div>

    <div class="tbl">
        <div class="tbl_cell">Center</div>
        <div class="tbl_cell"><input type="text"></div>
    </div>

    <div class="tbl">
        <div class="tbl_cell">Right</div>
        <div class="tbl_cell"><input type="text"></div>
    </div>

    <div class="tbl">
        <div class="tbl_cell">Size</div>
        <div class="tbl_cell"><input type="text"></div>
    </div>

    <div>
        <input type="submit">
    </div>

</div>