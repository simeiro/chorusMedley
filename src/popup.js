// document.addEventListener("DOMContentLoaded", function() {//popup表示時の処理
//     chrome.storage.local.get(["onChorus"]).then((result) => {
//         if(result.onChorus){
//             document.getElementById("onChorus").checked = true;
//         }else{
//             document.getElementById("onChorus").checked = false;
//         }
//     });
//     chrome.storage.local.get(["onErrorSkip"]).then((result) => {
//         if(result.onErrorSkip){
//             document.getElementById("onErrorSkip").checked = true;
//         }else{
//             document.getElementById("onErrorSkip").checked = false;
//         }
//     });
//     chrome.storage.local.get(["onMute"]).then((result) => {
//         if(result.onMute){
//             document.getElementById("onMute").checked = true;
//         }else{
//             document.getElementById("onMute").checked = false;
//         }
//     });
    
    
// });
const settings = ["onChorus", "onErrorSkip", "onMute"];

document.addEventListener("DOMContentLoaded", function() {
    settings.forEach(setting => {
        chrome.storage.local.get([setting], (result) => {
            const element = document.getElementById(setting);
            if (element) {
                element.checked = result[setting] || false;
            }
        });
    });
});

settings.forEach(setting => {
    const element = document.getElementById(setting);
    if (element) {
        element.addEventListener("change", function() {
            chrome.storage.local.set({ [setting]: this.checked });
        });
    }
});


// document.getElementById("onChorus").addEventListener("change", function(){//サビ再生checkbox
//     if(this.checked){
//         chrome.storage.local.set({ onChorus: true });
//     }else{
//         chrome.storage.local.set({ onChorus: false });
//     }
// });

// document.getElementById("onErrorSkip").addEventListener("change", function(){//サビ再生checkbox
//     if(this.checked){
//         chrome.storage.local.set({ onErrorSkip: true });
//     }else{
//         chrome.storage.local.set({ onErrorSkip: false });
//     }
// });

// document.getElementById("onMute").addEventListener("change", function(){//サビ再生checkbox
//     if(this.checked){
//         chrome.storage.local.set({ onMute: true });
//     }else{
//         chrome.storage.local.set({ onMute: false });
//     }
// });


