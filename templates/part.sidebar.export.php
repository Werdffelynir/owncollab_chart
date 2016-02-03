<?php
/**
 * @var OCP\Template $this
 * @var array $_
 */


?>

<div class="tbl">
    <div class="tbl_cell export_gantt export_excel">

            <h4>Excel</h4>
            <img src="<?php p($this->image_path('owncollab','ms_excel.png'))?>" alt="">

    </div>
    <div class="tbl_cell export_gantt export_pdf">

            <h4>PDF</h4>
            <img src="<?php p($this->image_path('owncollab','application-pdf.png'))?>" alt="">

    </div>
    <div class="tbl_cell export_gantt export_img">

            <h4>Image</h4>
            <img src="<?php p($this->image_path('owncollab','image.png'))?>" alt="">

    </div>
    <div class="tbl_cell export_gantt export_ical">

            <h4>iCalendar</h4>
            <img src="<?php p($this->image_path('owncollab','ical.png'))?>" alt="">

    </div>
    <div class="tbl_cell export_gantt export_mc">

            <h4>MS Project</h4>
            <img src="<?php p($this->image_path('owncollab','ms_project.png'))?>" alt="">

    </div>
</div>

