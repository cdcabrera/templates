(function (window, undefined) {

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

    function appHeartbeat(_settings) {
        var index = _settings.online,
            message = document.getElementById("online-status");
        if (navigator.onLine) {
            _settings.online = true;
            _settings.interval++;
            if (index != _settings.online) { onlineStatusChange(_settings.online) }
            message.innerHTML = "OnlineStatus: ONLINE: " + _settings.interval;
            return _settings;
        } else {
            _settings.online = false;
            _settings.interval++;
            if (index != _settings.online) { onlineStatusChange(_settings.online) }
            message.innerHTML = "OnlineStatus: OFFLINE: " + _settings.interval;
            return _settings;
        }
    }

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

    function _userDismissPrompt(ele) {
        window.localStorage.setItem("dismiss", true);
        var prompt = ele.parentNode.parentNode;
        prompt.style.display = "none";
    }

    function autoDismissPrompt(ele) {
        var prompt = document.getElementById("bookmark-prompt");
        if (prompt != null) {
            var promptTimer = setInterval(function () { ele.removeChild(prompt); clearInterval(promptTimer); }, _settings.mobilePromptDismiss);
        }
    }

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

    function _initialOffline() {
        // application started offline, do something
        alert("You are currently offline.");
    }

    function _onlineStatusChange(status) {
        // your code for going online/offline goes here
        switch (status) {
            case true:
                var message = "online"
                alert("You have gone " + message + ".");
                break;
            case false:
                var message = "offline"
                alert("You have gone " + message + ".");
                break;
        }
    }

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
        visitCount: window.localStorage.getItem("visits"),
        mobilePromptDismiss: 20000,
        heartBeatTimer: 1000,
        appCachStatusTimer: 1000
    }

    // build the debug panel, add ?debug=true to url to view
    debug();

    // how many times has the person visited? uses localStorage
    visitorInfo(_settings);

    // ios prompt to 'bookmark'
    if (window.localStorage.getItem("dismiss") != "true") { window.localStorage.setItem("dismiss", false); mobilePrompt(_settings); }

    // are we online or offline, onload?
    if (!navigator.onLine) { _settings.online = false; initialOffline(); }
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
    var appHeartbeatTimer = setInterval(function () { appHeartbeat(_settings); }, _settings.heartBeatTimer);

    // get manifest file status feedback
    var appCacheStatusTimer = setInterval(function () { appCacheStatus(_settings); }, _settings.appCachStatusTimer);

    //expose functions, allowing devs to write their own outside of this file.. new functions myst be 'below' these to overwrite
    window.initialOffline = _initialOffline;
    window.onlineStatusChange = _onlineStatusChange;

    //expose 'userDismissPrompt' so it can be used by the link in the bookmark prompt
    window.userDismissPrompt = _userDismissPrompt;

})(this);
