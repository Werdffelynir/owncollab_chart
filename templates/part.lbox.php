

    <div class="lbox_line">
        <p><?php p($l->t('Edit task details'));?><span id="real_id" style="color: #7aba7b; font-size: 10px;"></span></p>
        <input id="lbox_taskname" type="text" value="">
    </div>


    <div class="lbox_line">
        <p><?php p($l->t('Assign to resources'));?></p>
        <input id="lbox_resources" type="text" value="">
    </div>
    <div id="lbox_resources_pop" class="lbox_popup" style="display: none">
        <div class="close">X</div>
        <div class="content"></div>
    </div>

    <div class="lbox_line tbl">
        <div class="tbl_cell"> <?php p($l->t('Start'));?> </div>
        <div class="tbl_cell">
            <input id="lbox_start_date" class="datetimepic" type="text" value="">
        </div>

        <div class="tbl_cell"> <?php p($l->t('End'));?> </div>
        <div class="tbl_cell">
            <input id="lbox_end_date" class="datetimepic" type="text" value="">
        </div>
    </div>


    <div class="lbox_line tbl">
        <div class="tbl_cell"><?php p($l->t('Predecessor'));?> </div>
        <div class="tbl_cell">
            <input id="lbox_predecessor" type="text" value="">
        </div>

        <div class="tbl_cell"><?php p($l->t('Buffer'));?> </div>
        <div class="tbl_cell">
            <input id="lbox_buffer" type="text" value="">
        </div>
    </div>


    <div id="lbox_resources_predecessor" class="lbox_popup" style="display: none">
        <div class="close">X</div>
        <div class="content"></div>
    </div>

    <div class="lbox_line tbl">
        <div class="tbl_cell"><?php p($l->t('Progress'));?> </div>
        <div class="tbl_cell">
            <input id="lbox_progress" type="text" value="">
        </div>

        <div class="tbl_cell"><?php p($l->t('Milestone'));?></div>
        <div class="tbl_cell">
            <input id="lbox_milestone" type="checkbox" value="">
        </div>
    </div>


    <div class="lbox_line tbl">
        <div class="tbl_cell">
            <button id="lbox_save"><?php p($l->t('Save'));?></button>
        </div>
        <div class="tbl_cell">
            <button id="lbox_cancel"><?php p($l->t('Cancel'));?></button>
        </div>
        <div class="tbl_cell txt_right">
            <button id="lbox_delete"><?php p($l->t('Delete'));?></button>
        </div>
    </div>


