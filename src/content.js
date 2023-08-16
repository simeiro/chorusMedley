chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.act === "skipVideo") {
        document.getElementsByTagName('video')[0].currentTime = Number(request.chorus[0] / 1000) -1;
        chrome.storage.local.get(["onMute"]).then((result) => {
            if(result.onMute && document.querySelector('.ytp-mute-button').getAttribute('title') === "ミュート解除（m）"){
                document.getElementsByClassName('ytp-mute-button')[0].click();
            }
        });
        // if (document.querySelector('.ytp-play-button').getAttribute('title') === "再生（k）"){//再生が止まってる場合再生する
        //     document.getElementsByClassName('ytp-play-button')[0].click();
        // }
        
        
        console.log(request.chorus[0] + "(サビ開始時刻ms), " + request.chorus[1] + "(サビ時間ms)");
        skip(request.chorus, request.url);
    }
    if (request.act === "skipVideoSoon"){
        document.getElementsByTagName('video')[0].currentTime = Number(convertTime(document.getElementsByClassName("ytp-time-duration")[0].innerText) / 1000)-1.5;
    }
    if (request.act === "resetBar"){
        returnBar();
    }
});

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function skip(chorus, url){ //ms
    // chrome.runtime.sendMessage({sendFunction: "checkSameURL"}, (response)=>{
    //     console.log(response);
    // });
    // console.log(url);
    // chrome.storage.local.get(["loadCount"]).then((result) => {
    //     chrome.storage.local.set({ loadCount: result.loadCount + 1 });
    // });
    let differentUrlFlag = false;
    changeBar();
    await sleep(chorus[1]+2000); //一回目の待機時間
    while(true){
        let nowTime = getNowTime();
        await chrome.storage.local.get(["nowUrl"]).then((result) => {
            if(result.nowUrl !== url){
                differentUrlFlag = true;
            }
        });
        if(differentUrlFlag){
            console.log("待機処理終了(url違い判定)");
            break;
        }

        if(chorus[0] + chorus[1] >= nowTime){
            console.log((chorus[1]) - (nowTime - chorus[0]) + "(追加次曲待機時間ms)");
            await sleep((chorus[1]) - (nowTime - chorus[0]));
        }else{
            console.log("待機処理終了");
            break;
        }
    }
    if(!differentUrlFlag){
        document.getElementsByTagName('video')[0].currentTime = Number(convertTime(document.getElementsByClassName("ytp-time-duration")[0].innerText) / 1000);
        chrome.storage.local.get(["onMute"]).then((result) => {
            if(result.onMute && document.querySelector('.ytp-mute-button').getAttribute('title') === "ミュート（消音）（m）"){
                document.getElementsByClassName('ytp-mute-button')[0].click();
            }
        });
    }
    // document.getElementsByTagName('video')[0].currentTime = Number(convertTime(document.getElementsByClassName("ytp-time-duration")[0].innerText) / 1000);
    

    // chrome.storage.local.get(["loadCount"]).then((result) => {
    //     console.log(result.loadCount);
    //     if(result.loadCount === 1){//前の動画、リロード前動画のスキップ防止
    //         // document.getElementsByTagName('video')[0].currentTime = Number(convertTime(document.getElementsByClassName("ytp-time-duration")[0].innerText) / 1000);
    //         document.getElementsByTagName('video')[0].currentTime = Number(convertTime(document.getElementsByClassName("ytp-time-duration")[0].innerText) / 1000);
    //         if(document.querySelector('.ytp-mute-button').getAttribute('title') === "ミュート（消音）（m）"){//次曲再生時、最初に少し音が流れる現象を防ぐ
    //             document.getElementsByClassName('ytp-mute-button')[0].click();
    //         }
    //     }
    //     chrome.storage.local.set({ loadCount: result.loadCount - 1 });
    // });

    // getCurrentTab().then((tab) => {
	// 	console.log(tab.url);
	// });
    
    // document.getElementsByClassName("ytp-next-button")[0].click();  
    // let nowTime = document.getElementsByClassName("ytp-time-current")[0].innerText;
    // console.log(nowTime);
    // console.log(convertTime(nowTime));
}

// //再生バー無効化
// const progressElement = document.querySelector('.ytp-progress-bar-container');
// progressElement.addEventListener('click', (event) => {
//     progressElement.remove();
//     console.log("反応");
//     // event.stopPropagation();
//     // chrome.storage.local.get(["onFunction"]).then((result) => {
//     //     if(result.onFunction){
//     //         event.preventDefault();
//     //         console.log("おけまる");
//     //     }
//     // });
// });

async function getCurrentTab() {
	let queryOptions = { active: true, currentWindow: true };
	let [tab] = await chrome.tabs.query(queryOptions);
    console.log(tab);
	return tab;
}


function convertTime(strTime){
    let timeArray = strTime.split(":")
    let msTime = (parseInt(timeArray[0])*60 + parseInt(timeArray[1]))*1000
    return msTime;
}

function getNowTime(){
    // const playerElement = document.querySelector(".html5-video-player");
    // if (playerElement && playerElement.classList.contains("ytp-autohide")) {
    //     console.log("waaa");
    //     playerElement.classList.remove("ytp-autohide");
    // } else {
    //     console.log(playerElement);
    // }
    // console.log(currentTime);
    if (document.querySelector('.ytp-play-button').getAttribute('title') === "一時停止（k）"){
        document.getElementsByClassName('ytp-play-button')[0].click();
        document.getElementsByClassName('ytp-play-button')[0].click();
    }
    return Number(convertTime(document.getElementsByClassName("ytp-time-current")[0].innerText));
    // console.log(convertTime(document.getElementsByClassName("ytp-time-current")[0].innerText));
}

function changeBar(){
    const colorElement = document.querySelector(".ytp-play-progress.ytp-swatch-background-color");
    const progressElement = document.querySelector('.ytp-progress-bar-container');
    colorElement.style.backgroundColor = "#86cecb";
    progressElement.style.visibility ='hidden';
    return;
}

function returnBar(){
    const colorElement = document.querySelector(".ytp-play-progress.ytp-swatch-background-color");
    const progressElement = document.querySelector('.ytp-progress-bar-container');
    colorElement.style.backgroundColor = "#f00";
    progressElement.style.visibility ='visible';
    return;
}

