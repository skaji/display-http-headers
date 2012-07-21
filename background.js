var regexp_url;
var vars = getUrlVars();
if ("url" in vars) {
    try {
        regexp_url = new RegExp(vars.url);
        $("#url").val(vars.url);
    }
    catch (e) {
        console.error(e);
        regexp_url = undefined;
    }
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('#!/') + 3).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = decodeURIComponent(hash[1]);
    }
    return vars;
}

function filter_url() {
    var url = $('#url').val();
//    location.href = "background.html"
//        + (url === '' ? '' : '#!/url=' + encodeURIComponent(url));
    location.href = "background.html" +
        '#!/url=' + encodeURIComponent(url);
    location.reload();
}
$("#button").click(function () {
    filter_url();
});

$("#url").keypress(function (event) {
    var enter_key = 13;
    if (event.which === enter_key) {
        filter_url();
    }
});

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
var filter = {
    urls: [
        "<all_urls>"
    ]
};
var opt_extraInfoSpec = function (request_or_response) {
    return [
        request_or_response + "Headers"
    ];
};
var opt_extraInfoSpec_request  = opt_extraInfoSpec("request");
var opt_extraInfoSpec_response = opt_extraInfoSpec("response");



chrome.webRequest.onSendHeaders.addListener(
    callback_request,
    filter,
    opt_extraInfoSpec_request
);
chrome.webRequest.onHeadersReceived.addListener(
    callback_response,
    filter,
    opt_extraInfoSpec_response
);
