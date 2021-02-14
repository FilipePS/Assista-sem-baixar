var video_urls = []

function addVideoUrl(url) {
    if (video_urls.indexOf(url) == -1) {
        video_urls.push(url)
    }
}

// TODO Verificar o Content-Type para ter certeza de que se trata de um vídeo
function onHeadersReceived(details) {
    for (let header of details.responseHeaders) {
        if (header.name.toLowerCase() === "content-disposition" && header.value.startsWith("attachment")) {
            header.value = header.value.replace("attachment", "inline")
            addVideoUrl(details.url)
            return { responseHeaders: details.responseHeaders }
        }
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
