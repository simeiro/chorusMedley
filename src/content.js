chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.act === "skipVideo") {
        document.getElementsByTagName('video')[0].currentTime = Number(request.chorus[0] / 1000) -1;
        console.log(request.chorus);
        skip(request.chorus[1]+2000, request.url);
    }
});

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function skip(time, url){ //ms
    // chrome.runtime.sendMessage({sendFunction: "checkSameURL"}, (response)=>{
    //     console.log(response);
    // });
    await sleep(time);
    // getCurrentTab().then((tab) => {
	// 	console.log(tab.url);
	// });
    
    document.getElementsByClassName("ytp-next-button")[0].click();  
    let nowTime = document.getElementsByClassName("ytp-time-current")[0].innerText;
    console.log(nowTime);
    console.log(convertTime(nowTime));
}

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


