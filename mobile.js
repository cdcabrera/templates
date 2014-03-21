(function (window, undefined) {
    // get all vars from url
    function getUrlVars() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }

    // change pointer for touch devices and add class to <html/>
    function pointerSettings(_settings) {
        var html = document.getElementsByTagName("html")[0];
        if (_settings.agent.indexOf('iPhone') != -1 || _settings.agent.indexOf('iPad') != -1 || _settings.agent.indexOf('Android') != -1) {
            var original = html.getAttribute('class');
            original += " touch-enabled";
            html.setAttribute('class', original);
            _settings.press = 'touchend';
            return _settings.press;
        }
        if (window.navigator.msPointerEnabled) {
            var original = html.getAttribute('class');
            original += " ms-pointer-enabled";
            html.setAttribute('class', original);
            _settings.press = 'MSPointerUp';
            return _settings.press;
        }
    }

    // check online status of the page
    function appHeartbeat(_settings,_model) {
        var index = _settings.online,
            message = document.getElementById("online-status");
        if (navigator.onLine) {
            _settings.online = true;
            _settings.interval++;
            if (index != _settings.online) { _onlineStatusChange(_settings.online,_model) }
            message.innerHTML = "OnlineStatus: ONLINE: " + _settings.interval;
            return _settings;
        } else {
            _settings.online = false;
            _settings.interval++;
            if (index != _settings.online) { _onlineStatusChange(_settings.online,_model) }
            message.innerHTML = "OnlineStatus: OFFLINE: " + _settings.interval;
            return _settings;
        }
    }

    // app cache status, displays in debug panel
    function appCacheStatus(_settings) {
        var appCache = window.applicationCache,
            message = document.getElementById("app-cache-status");
        switch (appCache.status) {
            case appCache.UNCACHED: // UNCACHED == 0
                message.innerHTML = "AppCacheStatus: UNCACHED";
                break;
            case appCache.IDLE: // IDLE == 1
                message.innerHTML = "AppCacheStatus: IDLE";
                break;
            case appCache.CHECKING: // CHECKING == 2
                message.innerHTML = "AppCacheStatus: CHECKING";
                break;
            case appCache.DOWNLOADING: // DOWNLOADING == 3
                message.innerHTML = "AppCacheStatus: DOWNLOADING";
                break;
            case appCache.UPDATEREADY:  // UPDATEREADY == 4
                message.innerHTML = "AppCacheStatus: UPDATEREADY";
                appCache.swapCache();
                break;
            case appCache.OBSOLETE: // OBSOLETE == 5
                message.innerHTML = "AppCacheStatus: OBSOLETE";
                break;
            default:
                message.innerHTML = "AppCacheStatus: UKNOWN CACHE STATUS";
                break;
        };
        _settings.cacheStatus = appCache.status;
        return _settings.cacheStatus;
    }

    // going back online, allow form to submit
    function fixFormSubmission(txt,id) {
        var ele = document.getElementsByTagName("form")[0];
        if (ele) {
            var submit = document.getElementsByName("submit")[0];
            submit.value = txt;
            submit.onclick = function () {
                localStorage.removeItem(id);
                return true;
            }
        }
    }

    // you went offline, store form data to localStorage
    function offlineFormData(txt,exception) {
        var ele = document.getElementsByTagName("form")[0];
        if (ele) {
            var submit = document.getElementsByName("submit")[0];
            submit.onclick = function () {
                storeFormValuesLocalStorage(exception);
                return false;
            }
            submit.value = txt;
        }
    }

    // return visit to form, you have saved data, do you want to use it?
    function loadData() {
        var formUrl = window.location.href;
        urlParts = formUrl.split("?");
        baseUrl = urlParts[0].split("#");
        var formId = "fd:" + baseUrl[0];
        var formData = window.localStorage.getItem(formId);
        if (formData) {
            var current = new Date(),
                prev = new Date(JSON.parse(formData)[0].value),
                timepassed = (current - prev),
                day = prev.getDate(),
                mon = prev.getMonth(),
                yr = prev.getFullYear();

            var months = {
                0: "Jan.",
                1: "Feb.",
                2: "Mar.",
                3: "Apr.",
                4: "May",
                5: "Jun.",
                6: "Jul.",
                7: "Aug.",
                8: "Sep.",
                9: "Oct.",
                10: "Nov.",
                11: "Dec."
            }

            function getMonthName(int) {
                monthName = months[int];
                return monthName;
            }
            
            var dataTimeStamp = getMonthName(mon) + " " + day + ", " + yr;

            var loadSavedData = confirm("Welcome back. Load your saved data from " + dataTimeStamp + "?");
            if (loadSavedData) {
                for (var i = 1; i < JSON.parse(formData).length; i++) {
                 //   alert(JSON.parse(formData)[i].name);
                    var key = JSON.parse(formData)[i].name,
                        val = JSON.parse(formData)[i].value,
                        chk = JSON.parse(formData)[i].checked,
                        typ = JSON.parse(formData)[i].type;

                    if (chk != "true") {
                        document.getElementsByName(key)[0].value = val;
                        //alert(key + ":" + val);
                    } else {
                        var inputs = document.getElementsByName(key);
                        for (var j = 0; j < inputs.length; j++) {
                            var trueValue = inputs[j].value;
                            if (val == trueValue) {
                                inputs[j].checked = true;
                            }
                        }
                    }
                }
            } else {
                var deleteSavedData = confirm("Would you like to delete your saved data?");
                if (deleteSavedData) {
                    window.localStorage.setItem(formId, "");
                    alert("Data Deleted");
                }
            }
        }
    }

    // loop through the form and store the data, there is a css class that will  make this ignore an input
    function storeFormValuesLocalStorage(exception) {
        var ele = document.getElementsByTagName("form")[0];
            // create a unique id for the form that can be duplicated, on page, on return visits...           
            var formUrl = window.location.href;
            urlParts = formUrl.split("?");
            baseUrl = urlParts[0].split("#");
            var formId = "fd:" + baseUrl[0];
            var formData = window.localStorage.getItem(formId);
            if (!formData) {
                var timeStamp = new Date();
                var fields = ele.elements,
                    data = "{\"name\": \"time_stamp\", \"value\":\"" + timeStamp + "\", \"type\":\"datetime\"}";
                for (var i = 0; i < fields.length; i++) {

                    var key = fields[i].name,
                        val = fields[i].value,
                        type = fields[i].type,
                        cssClass = fields[i].className,
                        checked = "";

                    if (cssClass.indexOf(exception) == -1 && fields[i].readOnly == false && fields[i].disabled == false && type != "password") {
                        val = val.replace(/["]/g, "&#34;").replace(/[']/g, "&#39;").replace(/[&]/g, '&amp;').replace(/[<]/g, '&lt;').replace(/[>]/g, '&gt;').replace(/(?:\s\s+|\n|\t)/g, ' ');

                        if (type == "radio" || type == "checkbox") { checked = ", \"checked\":\"" + fields[i].checked + "\""; }
                        var obj = ",{\"name\": \"" + key + "\", \"value\": \"" + val + "\", \"type\": \"" + type + "\"" + checked + "}";

                        if (val.length >= 1 && type != "submit" && type != "reset" && type != "radio" && type != "checkbox") {
                            data += obj;
                        }
                        else if ((type == "radio" || type == "checkbox") && fields[i].checked === true) {
                            data += obj;
                        }
                    }
                }
                window.localStorage.setItem(formId, "[" + data + "]");
                alert("Data saved.");
            } else {
                var replace = confirm("This will replace your previously saved data. Are you sure?");
                if (replace) {
                    window.localStorage.setItem(formId, "");
                    storeFormValuesLocalStorage(exception);
                }
            }
    }

    // for mobile/touch interfaces, replaces click event. removes the 300ms delay before action.
    function updatePageLinks(cssException) {
            var getLinks = document.links;
            if (getLinks.length >= 1) {
                for (var i = 0; i < getLinks.length; i++) {
                    var destination = getLinks[i].href,
                        target = getLinks[i].getAttribute("target"),
                        cssClass = getLinks[i].getAttribute("class");
                    // if the link does not contain a 'target="_blank"' make it part of the app
                    // need to account for modals and create an opt-out css class to break this behaviour
                    if (target == null) {
                        if (cssClass == null || cssClass.indexOf(cssException) == -1 && cssClass.indexOf("modal") == -1) {
                            getLinks[i].onclick = function (event) {
                                event.preventDefault();
                                document.location.href = this;
                            }
                        }
                    } else {
                        if (target == "_blank") {
                            getLinks[i].onclick = function () {
                                var exitApp = confirm("Open this link in Mobile Safari?");
                                if (exitApp) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                        }
                    }
                }
            }
        }

    // bookmark prompt for mobile devices
    function mobilePrompt(_settings) {
        var destination = document.getElementsByTagName("body")[0];
        if (!window.navigator.standalone) {

            var prompt,
                mobile = false,
                ui,
                os;

            if (_settings.agent.indexOf('CriOS') != -1) {
                // chrome on ios
                mobile = true;
                ui = "chrome";
                os = "ios";
            } else {
                // everything else
                if (_settings.agent.indexOf('iPad') != -1) {
                    mobile = true;
                    ui = "ipad";
                    os = "ios";
                }
                else if (_settings.agent.indexOf('iPod') != -1) {
                    mobile = true;
                    ui = "ipod";
                    os = "ios";
                }
                else if (_settings.agent.indexOf('iPhone') != -1) {
                    mobile = true;
                    ui = "iphone";
                    os = "ios";
                }
                else if (_settings.agent.indexOf('Android') != -1) {
                    mobile = true;
                    os = "android";
                    if (_settings.agent.indexOf('Chrome') != -1) {
                        ui = "chrome";
                    } else {
                        ui = "generic";
                    }
                }
            }

            if (mobile == true){
                prompt = document.createElement("div");
                prompt.setAttribute("id", "bookmark-prompt");
                prompt.setAttribute("class", os + " " + ui);

                var title,
                    message;

                switch (_settings.visitCount) {
                    case 1:
                        title = "Remember Us!"
                        break;
                    default:
                        title = "Welcome Back!"
                }

                switch (ui) {
                    case "iphone":
                        message = "Tap below to <strong>bookmark</strong> or <strong>Add to Home Screen</strong>."
                        break;
                    case "ipod":
                        message = "Tap below to <strong>bookmark</strong> or <strong>Add to Home Screen</strong>."
                        break;
                    case "ipad":
                        message = "Tap above to <strong>bookmark</strong> or <strong>Add to Home Screen</strong>."
                        break;
                    default:
                        message = "<strong>Bookmark this page</strong> for quick access from your phone or tablet."
                }

                var promptContent = "<div class='hd'>" + title + "</div><div class='bd'>" + message + "</div><div class='ft'><a href='#' onclick='javascript: userDismissPrompt(this); return false;'>Dismiss</a></div>";
                prompt.innerHTML = promptContent;
                destination.insertBefore(prompt, destination.firstChild);
                autoDismissPrompt(destination);
            }
        }
    }

    // user dismisses the bookmark prompt, dont bother them again. uses localStorage.
    function _userDismissPrompt(ele) {
        window.localStorage.setItem("dismiss", true);
        var prompt = ele.parentNode.parentNode;
        prompt.style.display = "none";
    }

    // make the prompt go away after a couple of seconds (set in _settings obj)
    function autoDismissPrompt(ele) {
        var prompt = document.getElementById("bookmark-prompt");
        if (prompt != null) {
            var promptTimer = setInterval(function () { ele.removeChild(prompt); clearInterval(promptTimer); }, _settings.mobilePromptDismiss);
        }
    }

    // count visits
    function visitorInfo() {
        if (_settings.visitCount == null) {
            _settings.visitCount = 1;
            window.localStorage.setItem("visits", _settings.visitCount);
            return _settings.visitCount;
        } else {
            _settings.visitCount++;
            window.localStorage.setItem("visits", _settings.visitCount);
            return _settings.visitCount;
        }
    }

    // works with app cache enabled. user is offline and starts web app.
    function _initialOffline() {
        // application started offline, do something
        alert("You are currently offline.");
        offlineFormData(_model.buttons.save,_settings.formStorageExceptionCss);
    }

    // online status changes
    function _onlineStatusChange(status) {
        // your code for going online/offline goes here
        switch (status) {
            case true:
                var message = "online"
                alert("You have gone " + message + ".");
                var formUrl = window.location.href;
                urlParts = formUrl.split("?");
                baseUrl = urlParts[0].split("#");
                var formId = "fd:" + baseUrl[0];
                fixFormSubmission(_model.buttons.submit,formId);
                break;
            case false:
                var message = "offline"
                alert("You have gone " + message + ".");
                offlineFormData(_model.buttons.save,_settings.formStorageExceptionCss);
                break;
        }
    }

    // create, populate the debug panel
    function debug() {
        var debug = document.createElement("ul");
        debug.setAttribute("id", "debug-panel");
        debug.setAttribute("style", "margin:0;border-radius:5px;border-bottom:solid 5px #000;max-width:200px;position:fixed;top:16px;right:16px;z-index:999999;background-color:#222;color:#fff;font: 12px/16px 'arial',sans-serif;padding:8px 16px 8px 24px;opacity: .5");
        if (getUrlVars()["debug"] == "true") {
            debug.style.display = "block";
        } else {
            debug.style.display = "none";
        }
        debug.innerHTML = "<li id='user-agent'>UserAgent: " + _settings.agent + "</li><li id='online-status'></li><li id='app-cache-status'></li>";
        document.getElementsByTagName("body")[0].appendChild(debug);
    }

    // global settings object
    var _settings = {
        interval: 0,
        cacheStatus: 0,
        online: true,
        press: "click",
        agent: navigator.userAgent,
        clickExceptionCss: "needs-click", // strictly for ios 'standalone' apps
        formStorageExceptionCss: "no-storage",
        visitCount: window.localStorage.getItem("visits"),
        mobilePromptDismiss: 20000,
        heartBeatTimer: 1000,
        appCachStatusTimer: 1000
        },
        _ele = {
            submit: document.getElementsByName("submit")[0],
            reset: document.getElementsByName("reset")[0]
        },
        _model = {
            buttons: {
                submit: "Submit Data",
                save: "Save Data"
            }
        }

    // build the debug panel, add ?debug=true to url to view
    debug();

    // how many times has the person visited? uses localStorage
    visitorInfo(_settings);

    // ios prompt to 'bookmark'
    if (window.localStorage.getItem("dismiss") != "true") { window.localStorage.setItem("dismiss", false); mobilePrompt(_settings); }

    // are we online or offline, onload?
    if (!navigator.onLine) {
        _settings.online = false;
        _initialOffline(_model.buttons.save,_settings.formStorageExceptionCss);
        loadData();
    } else {
        _ele.submit.value = _model.buttons.submit;
        loadData();
    }

    appHeartbeat(_settings)

    // what is the manifest file doing, onload?
    appCacheStatus(_settings);

    // update pointer events for touchenabled devices
    pointerSettings(_settings);

    // ios 'home screen' app functions
    if (window.navigator.standalone) {
        window.onload = function () {
            // this changes the links from href to document.location... stops a link from popping mobile safari
            // onload to ensure all links are in the DOM
            updatePageLinks(_settings.clickExceptionCss);
        }
    }
    // set a timer on the appHeartbeat()... did we go online/offline since page load?
    var appHeartbeatTimer = setInterval(function () { appHeartbeat(_settings,_model); }, _settings.heartBeatTimer);

    // get manifest file status feedback
    var appCacheStatusTimer = setInterval(function () { appCacheStatus(_settings); }, _settings.appCachStatusTimer);

    //expose functions, allowing devs to write their own outside of this file.. new functions myst be 'below' these to overwrite
    window.initialOffline = _initialOffline;
    window.onlineStatusChange = _onlineStatusChange;

    //expose 'userDismissPrompt' so it can be used by the link in the bookmark prompt
    window.userDismissPrompt = _userDismissPrompt;

})(this);
