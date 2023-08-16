chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.local.set({ onChorus: true });
    chrome.storage.local.set({ onErrorSkip: true });
    chrome.storage.local.set({ nowUrl: "" });
    chrome.storage.local.set({ onMute: true});
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if(changeInfo.url){
        chrome.tabs.sendMessage(tab.id, {
            act: "resetBar"
        });
    }
    chrome.storage.local.get(["onChorus"]).then((result) => {
        if ((changeInfo.url) && (tab.url.includes("&list")) && (result.onChorus)){
            console.log('URL changed for tab', tabId, 'New URL:', changeInfo.url);
            chrome.storage.local.set({ nowUrl: changeInfo.url });
            callChorus(tab.url)
                .then(chorus => send(tab, chorus))
                .catch((error) =>{
                    chrome.tabs.sendMessage(tab.id, {
                        act: "skipVideoSoon"
                    });
                });
        }
    });
    
});

// chrome.action.onClicked.addListener((tab) => {
//     chrome.storage.local.get(["onChorus"]).then((result) => {
//         console.log(result.onChorus);
//     });
//     if (tab.url.includes("&list")){
//         callChorus(tab.url)
//             .then(chorus => send(tab, chorus))
//     }
    
    
//     // chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//     //     // nowUrl = tabs[0];
//     //     console.log(tabs[0].url);
//     // });
// });

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>{
//     if(request.sendFunction === "checkSameURL"){
//         let nowUrl;

//         getCurrentTab().then((tab) => {
//             console.log(tab);
//             sendResponse(nowUrl);
//         });
        
//     }
// });



function send(tab, chorus){
    let rtnPromise = chrome.tabs.sendMessage(tab.id, {
        act: "skipVideo",
        chorus: chorus,
        url: tab.url
    });
    rtnPromise
        .catch((error) =>{
            
        });
}

async function callChorus(youtube){
    let vocadb = "https://vocadb.net/api/songs?query=" + youtube + "&fields=PVs";
    let nicoRes = await fetch(vocadb);
    let nicoURL = await nicoRes.json();
    nicoURL = nicoURL["items"][0]["pvs"];

    for(let url of nicoURL){
        if (url["url"].includes("nicovideo")){
            nicoURL = url["url"];
            break;
        }
    }

    // console.log(nicoURL);
    let songle = await fetch("https://widget.songle.jp/api/v1/song/chorus.json?url=" + nicoURL);
    let chorus = await songle.json();
    chorus = chorus["chorusSegments"][0]["repeats"][0];
    let start = chorus["start"];
    let duration = chorus["duration"];
    console.log(start);
    console.log(duration);
    return [start, duration];
}


