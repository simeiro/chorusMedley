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
                .catch((error) =>{//cover処理
                    chrome.tabs.sendMessage(tab.id, {
                        func: "seachCoverUrl",
                        tab: tab,
                    });
                    // console.log("a");
                    
                });
        }
    }).catch((error) =>{
            
    });
    
});

chrome.runtime.onMessage.addListener((request) => {
    
    switch(request.func){
        case "coverToOriginal":
            let forFlag = false;
            let promises = [];
            for (const text of request.candidateText){
                let vocadb = "https://vocadb.net/api/songs?query=https://youtu.be/" + text + "&fields=PVs";
                let seachVocadb = async () => {
                    try{
                        let vocadbSarch = await fetch(vocadb);
                        vocadbSarch = await vocadbSarch.json();
                        return vocadbSarch;
                    }catch (error){
                        
                    };
                };
                let start;
                let duration;
                console.log(text);
                promises.push(
                    seachVocadb()
                        .then((vocadbData) =>{
                            let songName = vocadbData["items"][0]["defaultName"];
                            if (request.title.includes(songName)){
                                try{
                                    let seachUrl = vocadbData["items"][0]["pvs"];
                                    for(let url of seachUrl){
                                        if (url["url"].includes("nicovideo")){
                                            seachUrl = url["url"];
                                            break;
                                        }
                                    }
                                    if (seachUrl === vocadbData["items"][0]["pvs"]){
                                        seachUrl = "https://www.youtube.com/watch?v=" + text;
                                    }
                                    let seachSongle = async () => {
                                        try{
                                            let songleSarch = await fetch("https://widget.songle.jp/api/v1/song/chorus.json?url=" + seachUrl);
                                            songleSarch = await songleSarch.json();
                                            return songleSarch;
                                        }catch(error){
                                            return null;
                                        }
                                    };
                                    seachSongle()
                                        .then((songleData) =>{
                                            if (!forFlag){
                                                songleData = songleData["chorusSegments"][0]["repeats"][0];
                                                start = songleData["start"];
                                                duration = songleData["duration"];
                                                forFlag = true;
                                                send(request.tab, [start, duration]);
                                            }
                                        });
                                }catch(error){

                                }
                            }
                        })
                        .catch((error) => {
                            console.log("vocadb情報取得失敗");
                        })
                    );
            }
            Promise.all(promises)
                .then(() => {
                    // console.log(promises);//promisesが全て完了しているか
                    if (!forFlag) {
                        chrome.tabs.sendMessage(request.tab.id, {
                            func: "skipVideoSoon"
                        });
                    }
                });
        default:
            break;
    }
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
    let vocadbSarch;
    try{
        vocadbSarch = await fetch(vocadb);
    }catch(error){
        // console.log("動画URLに対するvocaDBの情報取得に失敗しました。");
        return null;
    }
    let seachURL = await vocadbSarch.json();
    seachURL = seachURL["items"][0]["pvs"];
    // console.log(seachURL);

    let nicoUrlFlag = true;
    for(let url of seachURL){
        if (url["url"].includes("nicovideo")){
            seachURL = url["url"];
            nicoUrlFlag = false;
            break;
        }
    }
    if(nicoUrlFlag){
        for(let url of seachURL){
            if (url["url"].includes("youtu.be")){
                seachURL = url["url"];
                seachURL = seachURL.replace("youtu.be/", "www.youtube.com/watch?v=");
                break;
            }
        }
    }

    // console.log(seachURL);
    let songle;
    try{
        songle = await fetch("https://widget.songle.jp/api/v1/song/chorus.json?url=" + seachURL);
    }catch(error){
        // console.log("動画URLに対するsongle情報の取得に失敗しました。");
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
