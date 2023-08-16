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
