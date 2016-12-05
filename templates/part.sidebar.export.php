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
    <form id="formExportToPDF">
        <div class="sidebar_line"><div class="sidebar_line_arrow"></div></div>

        <p><?php p($l->t('Define period to export'));?></p>

        <div class="tbl">
            <div class="tbl_cell"><span><?php p($l->t('Start'))?></span> <input name="pdf_start_date" type="text" class="."></div>
            <div class="tbl_cell txt_right"><span><?php p($l->t('End'))?></span> <input name="pdf_end_date" type="text"></div>
        </div>
<!---->
        <div class="tbl">
            <div class="tbl_cell width20"><?php p($l->t('Paper size'));?></div>
            <div class="tbl_cell">
                <select name="pdf_paper_size">
                    <option value="A1">A1 - 84.1 x 59.4 cm</option>
                    <option value="A2">A2 - 59.4 x 42 cm</option>
                    <option value="A3">A3 - 42 x 29.7 cm</option>
                    <option value="A4" selected>A4 - 29.7 x 21 cm</option>
                    <option value="A5">A5 - 21 x 14.8 cm</option>
                </select>
            </div>
        </div>

        <div class="tbl">
            <div class="tbl_cell width20"><?php p($l->t('Orientation'));?></div>
            <div class="tbl_cell">
                <select name="pdf_paper_orientation" id="">
                    <option value="P"><?php p($l->t('Portrait'));?></option>
                    <option value="L"><?php p($l->t('Album'));?></option>
                </select>
            </div>
        </div>


            <p><?php p($l->t('Define Header'));?></p>

            <div class="tbl">
                <div class="tbl_cell width20"><?php p($l->t('Left'));?></div>
                <div class="tbl_cell"><input name="pdf_head_left" type="text"></div>
            </div>

            <div class="tbl">
                <div class="tbl_cell width20"><?php p($l->t('Center'));?></div>
                <div class="tbl_cell"><input name="pdf_head_center"  type="text"></div>
            </div>

            <div class="tbl">
                <div class="tbl_cell width20"><?php p($l->t('Right'));?></div>
                <div class="tbl_cell"><input name="pdf_head_right"  type="text"></div>
            </div>

            <p><?php p($l->t('Define Footer'));?></p>

            <div class="tbl">
                <div class="tbl_cell width20"><?php p($l->t('Left'));?></div>
                <div class="tbl_cell"><input name="pdf_footer_left" type="text"></div>
            </div>

            <div class="tbl">
                <div class="tbl_cell width20"><?php p($l->t('Center'));?></div>
                <div class="tbl_cell"><input name="pdf_footer_center" type="text"></div>
            </div>

            <div class="tbl">
                <div class="tbl_cell width20"><?php p($l->t('Right'));?></div>
                <div class="tbl_cell"><input name="pdf_footer_right" type="text"></div>
            </div>
        <!--
                   <div class="tbl">
                       <div class="tbl_cell width20">Size</div>
                       <div class="tbl_cell"><input name="pdf_size" type="text"></div>
                   </div>
               -->
        <div>
            <input type="submit" value="<?php p($l->t('Export'));?>"> <div class="export_loader loader_min" style="display: none"></div>
        </div>

    </form>
</div>