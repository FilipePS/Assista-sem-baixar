// TODO Adicionar um botão no menu de contexto para adicionar legenda em qualquer vídeo
// TODO Adicionar opção de desativar a extensão em sites especificos

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
        if (headerContentDisposition && headerContentDisposition.value.toLowerCase().startsWith("attachment")) {
            headerContentDisposition.value = headerContentDisposition.value.replace("attachment", "inline")
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

function contextMenusOnClick(info) {
    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {action: "add-subtitles", targetElementId: info.targetElementId}, function(){})
    })
}

chrome.menus.create({
    id: "add-subtitles",
    documentUrlPatterns: ["*://*/*"],
    title: "Adicionar legenda neste vídeo",
    contexts: ["video"],
    onclick: contextMenusOnClick
})