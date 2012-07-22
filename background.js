var regexp_url;
var url = getParam("url");

if (url !== "") {
    try {
        regexp_url = new RegExp(url);
        $("#url").val(url);
    }
    catch (e) {
        console.error(e.message);
    }
}

function getParam(key) {
    var value = "";
    location.search.substring(1).split('&').forEach(function (elem) {
        var param = elem.split("=");
        if (param.length === 2 && param[0] === key) {
            value = decodeURIComponent(param[1]);
        }
    });
    return value;
}

var callback = function (request_or_response) {
    return function (details) {
        var header = details[request_or_response + "Headers"];
        var length = header.length;
        var requestId = details.requestId;
        var url = details.url;
        if (regexp_url != undefined) {
            if (! url.match(regexp_url) ) {
                return;
            }
        }
        var $div = $("<div></div>")
            .attr("id", request_or_response + requestId)
            .addClass(request_or_response);
        $div.append("<h3>" + request_or_response + "</h3>");
        var $ul = $("<ul></ul>");
        if (request_or_response === "request") {
            $ul.append($li("method", details.method));
        }
        $ul.append($li("url", url));

        for (var i = 0; i < length; i++) {
            $ul.append($li(header[i].name, header[i].value));
        }
        $div.append($ul);
        if (request_or_response === "request") {
            $div.appendTo("body");
        }
        else {
            $("#request" + requestId).after($div);
//            $("body").animate({
//                scrollTop: $(window).height()
//            }, "fast");
        }
    };
};

function $li(key, value) {
    return $("<li></li>")
        .append(
            $("<span></span>").addClass("key").text(key + ": ")
        ).append(
            $("<span></span>").text(value)
        );
}

var callback_request  = callback("request");
var callback_response = callback("response");

chrome.webRequest.onSendHeaders.addListener(
    callback_request,
    {urls:["<all_urls>"]},
    ["requestHeaders"]
);
chrome.webRequest.onHeadersReceived.addListener(
    callback_response,
    {urls:["<all_urls>"]},
    ["responseHeaders"]
);
