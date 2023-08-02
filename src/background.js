chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if (changeInfo.url){
        console.log('URL changed for tab', tabId, 'New URL:', changeInfo.url);
        callChorus(tab.url)
            .then(chorus => send(tab, chorus))
    }
});

chrome.action.onClicked.addListener((tab) => {
    callChorus(tab.url)
        .then(chorus => send(tab, chorus))
    
    // chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    //     // nowUrl = tabs[0];
    //     console.log(tabs[0].url);
    // });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>{
    if(request.sendFunction === "checkSameURL"){
        let nowUrl;

        // getCurrentTab().then((tab) => {
        //     console.log(tab);
        // });
        sendResponse(nowUrl);
        
    }
});



function send(tab, chorus){
    let rtnPromise = chrome.tabs.sendMessage(tab.id, {
        act: "skipVideo",
        chorus: chorus,
        url: tab.url
    });
    rtnPromise
        .catch((error) =>{
            console.log("fdsafdsafdas");
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

    console.log(nicoURL);
    let songle = await fetch("https://widget.songle.jp/api/v1/song/chorus.json?url=" + nicoURL);
    let chorus = await songle.json();
    chorus = chorus["chorusSegments"][0]["repeats"][0];
    let start = chorus["start"];
    let duration = chorus["duration"];
    console.log(start);
    console.log(duration);
    return [start, duration];
}

async function getCurrentTab() {
	// let queryOptions = { active: true, currentWindow: true };
	let [tab] = await chrome.tabs.query({});
	return [tab];
}


