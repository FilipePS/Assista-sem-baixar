var video_urls = []

function addVideoUrl(url) {
    if (video_urls.indexOf(url) == -1) {
        video_urls.push(url)
    }
}

function onHeadersReceived(details) {
    var headerContentDisposition = null
    var contentType = null
    
    for (let header of details.responseHeaders) {
        if (headerContentDisposition && contentType) break;

        var headerName = header.name.toLowerCase()
        if (headerName === "content-disposition") {
            headerContentDisposition = header
        } else if (headerName === "content-type") {
            contentType = header.value.toLowerCase()
        }
    }

    if (contentType && (contentType === "application/octet-stream" || contentType.startsWith("video"))) {
        addVideoUrl(details.url)
        if (headerContentDisposition.value.toLowerCase().startsWith("attachment")) {
            headerContentDisposition.value = headerContentDisposition.value.replace("attachment", "inline")
        }
        return { responseHeaders: details.responseHeaders }
    }
    return {}
}

chrome.webRequest.onHeadersReceived.addListener(
    onHeadersReceived, 
    {urls: ["<all_urls>"], types: ["main_frame", "sub_frame"]},
    ["blocking", "responseHeaders"]
)

function onMessage(message, sender, sendResponse) {
    if (message.action === "getVideoUrls") {
        sendResponse(video_urls)
    }
    return false
}

chrome.runtime.onMessage.addListener(onMessage)
