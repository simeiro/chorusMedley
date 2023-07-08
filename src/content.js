chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.act === "skipVideo") {
        document.getElementsByTagName('video')[0].currentTime = Number(request.chorus[0] / 1000) -1;
        skip(request.chorus[1]+2000);
    }
});

async function skip(time){ //ms
    await sleep(time);
    document.getElementsByClassName("ytp-next-button")[0].click();
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));


