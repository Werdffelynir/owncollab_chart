/**
 * Глобальный обект скрипта.
 * Точка оперирования с документами.
 *  
 *  @var object Tpl
 */
var Tpl = Tpl || {

        /**
         * Самообновляющаяся ссылка на динамическую библиотеку internal.data
         *
         * @var object data
         */
        data : {},
    
        debug : true,

        /**
         * версия скрипта
         */
        version : '0.0.1',

        /**
         * путь к директории с шаблонами/видами. должен быть относительным,
         * нужно учесть что он используется для как часть строки запроса.
         * возможно нужно настроить индивидуально под роутер, выделив ему API
         */
        templates: 'templates/',

        /**
         * доступные расширения файлов шаблона
         */
        templatesExtensions: ['.html','.php','.tpl','.txt','.text']

    };

(function(window, o){

    /**
     * Приватный обект
     *
     * @var {{*}} internal
     */
    var internal = {

        /**
         * Динамическая библиотека
         * Выполнять роль провайдера данных.
         * Накаплевает все результаты ответов что были выполненны, за всю жизнь скрипта
         *
         *  @var object data
         */
        data : {},

        /**
         *  Merge objects, primary container is `objectBase`
         */
        merge: function(objectBase, source){
            if(typeof objectBase === 'object' && typeof source === 'object' ){
                for (var key in source)
                    if (source.hasOwnProperty(key)) objectBase[key] = source[key];
                return objectBase;
            }else
                return false;
        },

        fileExtension: function (file){
            var p = String(file).split('.');
            return (p[p.length-1] !== undefined) ? p[p.length-1] : false;
        }

    };

    /**
     * Merge objects, primary container is `objectBase`, `source` updates the `objectBase`
     * @param objectBase
     * @param source
     * @returns {*}
     */
    o.merge = function(objectBase, source) {
        return internal.merge(objectBase, source);
    };


    /**
     * Сборка конфигурации
     *
     * @param conf
     */
    o.config = function(conf) {
        o.templates = conf.templates ? conf.templates : o.templates;
    };


    /**
     * Базовый подзапрос.
     *
     * @param url
     * @param callback
     * @param callbackError
     */
    o.request = function(url, callback, callbackError) {
        callbackError ? callbackError : o.callbackError;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        if(typeof callback === 'function')
            xhr.onload = callback;
        xhr.onerror = function(err){callbackError.call(o, err)};
        xhr.onloadend = function(err){callbackError.call(o, err)};
        xhr.send();
    };

    o.loadLastPath = '';
    /**
     * Загружает templates файл
     * Результат вернется как аргумент в функцию обратного вызова callback,
     * так-же результат сохраняется в динамической библиотеке internal.data[FILE_NAME].response
     *
     * @param fileName      имя файла html, без указания расширения
     * @param callback      функция обратного вызова. В функцию приходит аргумент
     *                          с ответом запроса и информ. о загруженых данных
     * @param callbackError
     */
    o.loadHTML = function(fileName, callback, callbackError) {
        callbackError = callbackError || o.callbackError;
        var ext = '';
        if( fileName.lastIndexOf('.') !== -1){
            var index =  fileName.lastIndexOf('.'),
                _ext = fileName.substr(index);
            if(o.templatesExtensions.indexOf(_ext) === -1) {
                ext = o.templatesExtensions[0];
            }
        } else ext = o.templatesExtensions[0];

        // generate url to template
        var url = o.templates + fileName + ext,

            onload = function(event) {
                o.loadLastPath = url;
                if(event.target instanceof XMLHttpRequest){
                    var xhr = event.target;
                    if(xhr.status === 200 && typeof callback === 'function'){
                        internal.data[fileName] = {
                            id: fileName,
                            source: o.templates + fileName + ext,
                            response: xhr.responseText
                        };
                        callback.call(o, xhr.responseText, internal.data[fileName]);
                    }
                } else {
                    callbackError.call(o, xhr);
                }
            },

            onerror = function(event) {
                if(event.target.status != 200)
                    callbackError.call(o, event.target);
            };
        
        o.request(url, onload, onerror);
    };


    /**
     * Загружает JSON данные
     */
    o.loadJSON = function(url, callback, callbackError) {
        var result, onload = function (event){
            if(event.target instanceof XMLHttpRequest){
                var xhr = event.target;
                if(xhr.status === 200 && typeof callback === 'function') {
                    result = JSON.parse(xhr.responseText);
                    callback.call(o, result);
                }
            } else {
                var _callbackError = callbackError || o.callbackError;
                _callbackError.call(o, xhr);
            }
        };

        o.request(url, onload, callbackError);
    };


    /**
     * Загружает один или несколько файлв, имена - параметры принимает в виде масива.
     * функция обратного вызова callback может получить в аргумент два различных типа ответа:
     *  - если передано в filesNamesArray всего одно значение, аргумент будет содержать прямой ответ загрузки этого файла.
     *  - но если передано на загрузку больше чем один файл - аргумент будет содержать все ответы 
     *          запросов в объекте - динамической библиотеки internal.data 
     *          (internal.data['FILE_NAME'] содержи все результаты ответов что были выполненны до этого, за всю жизнь скрипта)
     *
     * @param filesNamesArray   имена / url файлов в массиве
     * @param callback          выполняется когда все файлы будут загружены
     * @param callbackError     выполняется при возникновении ошибки.
     */
    o.include = function(filesNamesArray, callback, callbackError) {
        if(typeof filesNamesArray === 'string') filesNamesArray = [filesNamesArray];
        if(Object.prototype.toString.call(filesNamesArray) === '[object Array]'){

            o.include.iter = 0;
            o.include.amount = filesNamesArray.length;
            o.include.callBack = function(response){
                o.include.iter ++;
                if(o.include.iter === o.include.amount){
                    // обновляет ссылка на результаты с частного объекта internal.data
                    o.data = internal.merge(internal.data, o.data);
                    // если переда один файл на загрузку 
                    var arg = o.include.amount === 1 ? response : internal.data;
                    // вызов пользовательской функции
                    callback.call(o, arg);
                }
            };

            filesNamesArray.map(function(file){
                o.loadHTML(String(file).trim(), o.include.callBack, callbackError);
            });

        }
    };


    /**
     * Внедряет в переданый объект selector данные с dataSource, но перед этим
     * рендерит переменные params в dataSource
     *
     * @param selector      селектор для выборки, или объект в который будет внедрены данные
     * @param dataSource    данные
     * @param params        параметры для шаблона в dataSource
     * @returns {*}         если selector успешно выбран, функция вернет Node.ELEMENT_NODE
     *                          в этот объект будет добавлены свойства:
     *                              .dataSource         исходная строка
     *                              .dataImplemented    результат щаблонизации
     */
    o.inject = function(selector, dataSource, params){
        if(typeof selector === 'string'){
            selector = o.query(selector);
        }

        if(typeof selector === 'object' && selector.nodeType === Node.ELEMENT_NODE){
            selector.dataSource = dataSource;

            if(typeof dataSource === 'object'){
                selector.textContent = '';
                selector.appendChild(dataSource);
                if(params)
                    selector.innerHTML = o.renderString(selector.innerHTML, params);
            }else
                selector.innerHTML = selector.dataImplemented = o.renderString(dataSource, params);
        }
        return selector;
    };


    /**
     * Сводит шаблон с переменными
     *
     * @param stringData    строка с шаблонами
     * @param params        переменные
     * @returns {*}         вернет строку результата
     */
    o.renderString = function(stringData, params) {
        if(typeof params === 'object')
            for(var k in params)
                stringData = stringData.replace(new RegExp('{{'+k+'}}', 'gi'), params[k]);

        return stringData;
    };


    /**
     * Отдаст результат запроса, или если не указан параметр объект 
     *
     * @param name          имя загруженного файла 
     * @returns {*}         
     */
    o.data = function(name){
        if(name === undefined) 
            return internal.data;
        else if (internal.data[name] !== undefined) 
            return internal.data[name];
    };


    /**
     * Выберает DOM елемент с страницы, или вернет
     *
     * @param selector      имя загруженного файла
     * @returns {*}         
     */
    o.query = function(selector){
        var elem = document.querySelector(selector);
        if(!elem) {console.error("Can`t query DOM Element by selector: " + selector); return false; }
        else return elem;
    };

    /**
     * Execute callback function if DOM is loaded
     * @param callback
     */
    o.domLoaded = function(callback){
        if(o.domIsLoaded){
            callback();
        }else{
            document.addEventListener('DOMContentLoaded', callback, false);
        }
    };

    /**
     * Check an DOM is loaded
     * @returns {boolean}
     */
    o.domIsLoaded = function(){
        return !!o.query('body');
    };
    
    o.callbackError = function(e){
        if(o.debug)
            console.error(e);
    };

    /**
     * Сохранение данных на стороне пользователя.
     * 
     * @var function localGet
     * @var function localSet
     * @var function localKey
     * @var function localRemove
     */
    o.localGet = function (name, value) { 
        var result = window.localStorage.getItem(name);
        if (result === undefined) return value;
        try {return JSON.parse(result)}
        catch(e) {return result}
    };

    o.localSet = function (name, value) { 
        if(typeof value !== 'string') value = JSON.stringify(value);
        return window.localStorage.setItem(name, value);
    };

    o.localKey = function (index, value) { 
        var result = window.localStorage.key(index);
        if (result === undefined) return value;
        try {return JSON.parse(result)}
        catch(e) {return result}
    };

    o.localRemove = window.localStorage.removeItem;

})(window, Tpl);