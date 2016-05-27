if(App.namespace) { App.namespace('Action.Share', function(App) {

    /**
     * @namespace App.Action.Share
     * @type {*}
     */
    var share = {};

    /**
     * @namespace App.Action.Share.init
     */
    share.init = function (){

        // enabled jquery plugin datetimepicker for all elements with class name 'datetimepic'
        $('.datetimepic').datetimepicker({
            minDate: new Date(),
            controlType: 'select',
            oneLine: true,
            dateFormat: 'dd.mm.yy',
            timeFormat: 'HH:mm',
            onSelect:function(val, event){
                if(this.name == "share_expire_time"){
                    var elemTime = $('input[name=share_expire_time]')[0];
                    elemTime.value = val;
                    share.changeValue(elemTime);
                }
            }
        });

        // autocomplete for email sends
        var usersEmails = function(){
            var resources = App.Action.Project.resources(),
                group,
                userIter = 0,
                domain = OC.getHost(),
                list = [],
                all = App.Module.DataStore.get('groupsusers');

            for(group in all){
                var inGroup = false;
                for(userIter = 0; userIter < all[group].length; userIter ++) {
                    if(resources.indexOf(all[group][userIter]['uid']) !== -1) {
                        inGroup = true;
                        list.push({
                            value: all[group][userIter]['uid'],
                            type: 'user',
                            email: all[group][userIter]['uid'] + '@' + domain
                        });
                    }
                }

                if(inGroup){
                    list.push({
                        value: group,
                        type: 'group',
                        email: group + '@' + domain
                    });
                }
            }

            // static emails
            list.push({
                value: 'team',
                type: 'static',
                email: 'team@' + domain
            });

            list.push({
                value: 'support',
                type: 'static',
                email: 'support@' + domain
            });

            return list;
        };

        $(document).on('focus', "#owc_email_autocomplete", function (event) {
            $( this ).autocomplete({
                minLength: 0,
                source: usersEmails(),
                select: function( event, ui ) {
                    this.value = "";
                    share.emailsList(ui.item);
                    return false;
                }
            }).data("ui-autocomplete")._renderItem = function( ul, item ) {
                var emailLabel = (item.type == 'user') ? item.email : "<strong>"  +item.email+ "</strong>";
                return $('<li>')
                    .append('<a>' +  emailLabel + '</a>' )
                    .appendTo( ul );
            };
        });

        /** send email list to server */
        $('input[name=share_email_submit]').click(function(event){
            event.preventDefault();
            var emailsList = [];

            $('.share_email', App.node('sidebar')).each(function(index, item){
                emailsList.push({
                    id: item.getAttribute('data-id'),
                    type: item.getAttribute('data-type'),
                    email: item.getAttribute('data-email')
                });
            });

            App.Action.Api.request('mailer', function(response){
                console.log(response['send_result']);
                $('.share_email_butn').css('background', 'url("/apps/owncollab_chart/img/sent.png") no-repeat center center');
            },{
                list: emailsList,
                resources: App.Action.Project.resources()
            });

        });
    };

    share.emailsList = function(item){
        var wrap = document.createElement('div');
        var icon = document.createElement('div');
        var text = document.createElement('div');
        var butn = document.createElement('div');

        wrap.className = 'tbl share_email';
        wrap.setAttribute('data-id', item.value );
        wrap.setAttribute('data-type', item.type);
        wrap.setAttribute('data-email', item.email);

        icon.className = 'tbl_cell share_email_icon';
        text.className = 'tbl_cell share_email_text';
        butn.className = 'tbl_cell share_email_butn';

        butn.onclick = function(event){$(wrap).remove()};

        icon.innerHTML = '<strong> &#149; </strong>';
        text.innerHTML = item.email;

        wrap.appendChild(icon);
        wrap.appendChild(text);
        wrap.appendChild(butn);
        $('#share_emails_list').append(wrap);
    };


    /**
     * http://owncloud.loc/index.php/s/uN8QRLwyin0lsxit
     * @namespace App.Action.Share.changeValue
     * @param target
     */
    share.changeValue = function (target){
        var fieldName = target.name;

        if(fieldName === 'is_share'){

            if(target.checked === true) $('.chart_share_on').show();
            else $('.chart_share_on').hide();

            share.requestUseShare(fieldName, target.checked, function(response) {
                if(response['share_link']) {
                    $('input[name=share_link]').val(App.protocol + '://' + App.host + '/index.php/s/' + response['share_link']);
                }
            });

        }else

        // Set protected password
        if(fieldName === 'share_is_protected'){

            if(target.checked === true) $('.chart_share_password').show();
            else $('.chart_share_password').hide();

            share.requestUseShare(fieldName, target.checked, function(response) {

            });

        }else

        // Set expire timeout
        if(fieldName === 'share_password') {

            //console.log('share_password: ', target.value);
            share.requestUseShare(fieldName, target.value, function(response) {

            });

        }else

        // Set expire timeout
        if(fieldName === 'share_is_expire') {

            if(target.checked === true) $('.chart_share_expiration').show();
            else $('.chart_share_expiration').hide();

            share.requestUseShare(fieldName, target.checked, function(response) {

            });

        }else

        // Set expire timeout
        if(fieldName === 'share_expire_time') {

            //console.log('share_expire_time: ', target.value)
            share.requestUseShare(fieldName, target.value, function(response) {

            });

        }

    };


    share.readySaveShareExpireTime = true;

    /**
     * Request to change value
     * @param field
     * @param value
     * @param callback
     */
    share.requestUseShare = function (field, value, callback){
        App.Action.Api.request('useshare',function(response){

            console.log(response);
            if(typeof response === 'object' && !response['error'] && response['requesttoken']) {
                App.requesttoken = response.requesttoken;

                if(typeof callback === 'function')
                    callback.call(this, response);
            }



        }, {field:field, value:value});
    };

    return share

})}