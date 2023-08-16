chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.local.set({ onChorus: false });
    chrome.storage.local.set({ onErrorSkip: true });
    chrome.storage.local.set({ nowUrl: "" });
    chrome.storage.local.set({ onMute: true});
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if(changeInfo.url){
        chrome.tabs.sendMessage(tab.id, {
            func: "resetBar",
            url: changeInfo.url
        });
    }
    chrome.storage.local.get(["onChorus"]).then((result) => {
        if ((changeInfo.url) && (tab.url.includes("&list")) && (result.onChorus)){
            // console.log('URL changed for tab', tabId, 'New URL:', changeInfo.url);
            chrome.storage.local.set({ nowUrl: changeInfo.url });
            callChorus(tab.url)
                .then(chorus => send(tab, chorus))
                .catch((error) =>{
                    chrome.tabs.sendMessage(tab.id, {
                        func: "skipVideoSoon"
                    });
                });
        }
    }).catch((error) =>{
            
    });
    
});

function send(tab, chorus){
    chrome.tabs.sendMessage(tab.id, {
        func: "skipVideo",
        chorus: chorus,
        url: tab.url
    }).catch((error) =>{
            
    });
        
}

async function callChorus(youtube){
    let vocadb = "https://vocadb.net/api/songs?query=" + youtube + "&fields=PVs";
    let nicoRes;
    try{
        nicoRes = await fetch(vocadb);
    }catch(error){
        console.log("oi");
        return null;
    }
    let nicoURL = await nicoRes.json();
    nicoURL = nicoURL["items"][0]["pvs"];

    for(let url of nicoURL){
        if (url["url"].includes("nicovideo")){
            nicoURL = url["url"];
            break;
        }
    }

    // console.log(nicoURL);
    let songle;
    try{
        songle = await fetch("https://widget.songle.jp/api/v1/song/chorus.json?url=" + nicoURL);
    }catch(error){
        console.log("oi1");
        return null;
    }
    let chorus = await songle.json();
    chorus = chorus["chorusSegments"][0]["repeats"][0];
    let start = chorus["start"];
    let duration = chorus["duration"];
    // console.log(start);
    // console.log(duration);
    return [start, duration];
}
