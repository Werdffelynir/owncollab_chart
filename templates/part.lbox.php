
    <div>
        <div class="lbox_title">Edit task details</div>
        <input name="lbox_text" type="text">
    </div>

    <div>
        <div class="lbox_title">Assign to resources</div>
        <input name="lbox_users" type="text">
    </div>

    <div class="tbl">
        <div class="tbl_cell lbox_date_column">
            <div class="tbl">
                <div class="tbl_cell">Start</div>
                <div class="tbl_cell"><input name="lbox_start_date" type="text"></div>
            </div>
            <div class="tbl">
                <div class="tbl_cell">End</div>
                <div class="tbl_cell"><input name="lbox_end_date" type="text"></div>
            </div>
            <div class="tbl">
                <div class="tbl_cell">Progress</div>
                <div class="tbl_cell"><input name="lbox_progress" type="text"></div>
            </div>
        </div>
        <div class="tbl_cell valign_middle txt_center">
            <input name="lbox_predecessor" type="submit" value="Predecessor">
        </div>
        <div class="tbl_cell valign_middle txt_right">
            <div>
                <span>Milestone</span>
                <span>
                    <input id="lbm" name="lbox_milestone" type="checkbox">
                    <label for="lbm"><span></span></label>
                </span>
            </div>
        </div>
    </div>
