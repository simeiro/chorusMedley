chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if (changeInfo.url){
        callChorus(tab.url)
            .then(chorus => send(tab, chorus))
    }
});

chrome.action.onClicked.addListener((tab) => {
    callChorus(tab.url)
        .then(chorus => send(tab, chorus))
});

function send(tab, chorus){
    let rtnPromise = chrome.tabs.sendMessage(tab.id, {
        act: "skipVideo",
        chorus: chorus
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


