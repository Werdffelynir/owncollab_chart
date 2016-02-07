/**
 * Action lightbox.js
 */

(function($, OC, app){

    // elimination of dependence this action object
    if(typeof app.action.lightbox !== 'object') app.action.lightbox = {};

    // alias of app.action.lightbox
    var o = app.action.lightbox;

    o.task = null;

    o.field = null;

    o.popup = null;

    o.init = function(){

        //Add the section to the lightbox configuration:
        gantt.config.lightbox.sections = [
            {name:"template", height:260, type:"template", map_to:"base_template"}
        ];

        //Set the label for the section:
        gantt.locale.labels.section_template = "Edit task detail";

        //Set the content of the control with the help of some event, e.g. the onBeforeLightbox event:
        gantt.attachEvent("onBeforeLightbox", o.onBeforeLightbox);
        gantt.attachEvent("onLightbox", o.onLightbox);
        gantt.attachEvent("onAfterLightbox", o.onAfterLightbox);

        gantt.attachEvent("onLightboxSave", o.onLightboxSave);
        gantt.attachEvent("onLightboxCancel", o.onLightboxCancel);
        gantt.attachEvent("onLightboxDelete", o.onLightboxDelete);
    };

    o.onBeforeLightbox = function (id){
        o.task = gantt.getTask(id);
        o.task.base_template = '<div id="generate-lbox-wrapper">' + app.dom.lbox.innerHTML + '</div>';
        return true;
    };
    // `id`, `is_project`, `type`, `text`, `users`, `start_date`, `end_date`, `duration`, `order`, `progress`, `sortorder`, `parent`, `deadline`, `planned_start`, `planned_end`, `milestone`, `link`, `open`, `title`, `deleted`)
    //lbox_popup_text
    //

    o.onLightbox = function (id){
        o.field = (function(){
            var fsn = document.querySelectorAll('#generate-lbox-wrapper input'),
                fso = {};

            for(var i=0;i<fsn.length;i++){
                var _name = fsn[i]['name'].substr(5);
                fso[_name] = fsn[i];

                if(o.task[_name] !== undefined){
                    switch(_name){
                        case 'users':
                        case 'predecessor':
                            fso[_name].onclick = o.onClickLightboxInput;
                            break;
                        case 'buffer': break;
                        case 'start_date':
                        case 'end_date':
                            fso[_name].value = app.timeDateToStr(o.task[_name]);
                            break;
                        default:
                            fso[_name].value = o.task[_name];
                            fso[_name].onchange = o.onChangeLightboxInput;
                    }
                }

            }
            return fso;
        })();

        app.setTimepicker('input[name=lbox_start_date], input[name=lbox_end_date]', o.onChangeLightboxInputDate);

    };


    o.onAfterLightbox = function (){};

    o.onChangeLightboxInput = function (event){
        if(!o.task || !o.field) return;
        var target = event.target,
            name = target['name'].substr(5),
            value = target['value'],
            type = target['type'];

        if(o.task[name] !== undefined){
            o.task[name] = value;
        }
    };
    o.onChangeLightboxInputDate = function (date){
        if(!o.task || !o.field) return;
        o.task[this['name'].substr(5)] = app.timeStrToDate(date);
    };

    o.onClickLightboxInput = function (event){
        if(!o.task || !o.field) return;
        var target = this || event.target;


        if(target['name'] == 'lbox_users'){
            var popup = o.showPopup(target, 'aaaaaaaaaaaaalbox_usersaaaaaaaaaaaa');
            console.log('lbox_users',o.task);
        }
        else if(target['name'] == 'lbox_predecessor'){
            o.showPopup(target, 'aaaaaaaaaaaalbox_predecessoraaaaaaaaaaaaa');
            console.log('lbox_predecessor',o.task);
        }

        //console.log(target.name, target.value, target.type);
    };

    o.showPopup = function (afterElement, content){
        if(!o.popup){

            var _popup = document.createElement('div'),
                _popupWrap = document.createElement('div'),
                _popupClose = document.createElement('div');

            _popup.id = 'lbox_popup';
            _popup.className = 'lbox_popup';
            _popupWrap.className = 'lbox_popup_wrap';
            _popupClose.className = 'lbox_popup_close icon-close';
            _popupClose.onclick = function(e){o.showHide()};
            _popup.appendChild(_popupClose);
            _popup.appendChild(_popupWrap);
            o.popup =  _popup;
            o.popup.content = _popupWrap;
        }
        o.popup.content.innerHTML = '';
        if(content.nodeType === Node.ELEMENT_NODE) o.popup.content.appendChild(content);
        else if(typeof content === 'string') o.popup.content.innerHTML = content;

        afterElement.parentNode.appendChild(o.popup);
        return o.popup;
    };
    o.showHide = function (){
        $('#lbox_popup').remove()
    };



    o.onLightboxSave = function (id,task,isNew){
        app.u.objMerge(task, o.task);
        gantt.updateTask(id);
        return true;
    };
    o.onLightboxCancel = function (){
        o.task = o.field = null;
    };
    o.onLightboxDelete = function (){
        o.task = o.field = null;
    };


    /*onLightbox
     onLightboxButton
     onLightboxCancel
     onLightboxChange
     onLightboxDelete
     onLightboxSave



     lbox_popup
     lbox_popup_hide
     lbox_popup_wrap

     lbox_start_date
     lbox_end_date
     lbox_predecessor
     lbox_buffer
     lbox_progress
     lbox_end_milestone




     */
























    o.createField = function(name, value){};

    o.getNode = function(where, name){
        //var e = where.querySelectorAll(name);
    };

    o.addLightboxEvents = function(){};

    o.RemoveLightboxEvents = function(){};

})(jQuery, OC, app);
