chrome.runtime.onMessage.addListener(function(request){
    switch (request.func) {
        case "skipVideo":
            document.getElementsByTagName('video')[0].currentTime = Number(request.chorus[0] / 1000) - 1;
            chrome.storage.local.get(["onMute"]).then((result) => {
                if (result.onMute && document.querySelector('.ytp-mute-button').getAttribute('title') === "ミュート解除（m）") {
                document.getElementsByClassName('ytp-mute-button')[0].click();
                }
            }).catch((error) =>{
            
            });
            changeBar();
            // console.log(request.chorus[0] + "(サビ開始時刻ms), " + request.chorus[1] + "(サビ時間ms)");
            skip(request.chorus, request.url);
            break;
        case "skipVideoSoon":
            document.getElementsByTagName('video')[0].currentTime = Number(convertTime(document.getElementsByClassName("ytp-time-duration")[0].innerText) / 1000) - 1.5;
            break;
        case "resetBar":
            returnBar(request.url);
            break;
        default:
            break;
        }
});

async function skip(chorus, url){
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    let differentUrlFlag = false;
    await sleep(chorus[1]+2000); //一回目の待機時間
    while(true){
        let nowTime = getNowTime();
        await chrome.storage.local.get(["nowUrl"]).then((result) => {
            if(result.nowUrl !== url){
                differentUrlFlag = true;
            }
        }).catch((error) =>{
            
        });
        if(differentUrlFlag){
            // console.log("待機処理終了(url変更)");
            break;
        }

        if(chorus[0] + chorus[1] >= nowTime){
            // console.log((chorus[1]) - (nowTime - chorus[0]) + "(追加次曲待機時間ms)");
            await sleep((chorus[1]) - (nowTime - chorus[0]));
        }else{
            // console.log("待機処理終了(url変更なし)");
            break;
        }
    }
    if(!differentUrlFlag){
        document.getElementsByTagName('video')[0].currentTime = Number(convertTime(document.getElementsByClassName("ytp-time-duration")[0].innerText) / 1000);
        chrome.storage.local.get(["onMute"]).then((result) => {
            if(result.onMute && document.querySelector('.ytp-mute-button').getAttribute('title') === "ミュート（消音）（m）"){
                document.getElementsByClassName('ytp-mute-button')[0].click();
            }
        }).catch((error) =>{
            
        });
    }
}

function convertTime(strTime){
    let timeArray = strTime.split(":")
    let msTime = (parseInt(timeArray[0])*60 + parseInt(timeArray[1]))*1000
    return msTime;
}

function getNowTime(){
    if (document.querySelector('.ytp-play-button').getAttribute('title') === "一時停止（k）"){
        document.getElementsByClassName('ytp-play-button')[0].click();
        document.getElementsByClassName('ytp-play-button')[0].click();
    }
    return Number(convertTime(document.getElementsByClassName("ytp-time-current")[0].innerText));
}

function changeBar(){
    const colorElement = document.querySelector(".ytp-play-progress.ytp-swatch-background-color");
    const progressElement = document.querySelector('.ytp-progress-bar-container');
    colorElement.style.backgroundColor = "#86cecb";
    progressElement.style.visibility ='hidden';
    return;
}

function returnBar(url){
    const colorElement = document.querySelector(".ytp-play-progress.ytp-swatch-background-color");
    const progressElement = document.querySelector('.ytp-progress-bar-container');
    colorElement.style.backgroundColor = "#f00";
    progressElement.style.visibility ='visible';
    chrome.storage.local.get(["onChorus"]).then((result) => {
        if(!result.onChorus || !url.includes("&list")){
            if (document.querySelector('.ytp-mute-button').getAttribute('title') === "ミュート解除（m）") {
                document.getElementsByClassName('ytp-mute-button')[0].click();
            }
        }
    }).catch((error) =>{
            
    });
    return;
}
