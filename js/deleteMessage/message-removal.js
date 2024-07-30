
// document.getElementById("start-message-remove").addEventListener("click",()=>{
//     chrome.tabs.create({ url: "https://www.facebook.com/messages" }, tab => {
//         // Once the tab is updated & fully loaded, we will scrape the localStorage
//         chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
//             if (tabId === tab.id && changeInfo.status === 'complete') {
//               chrome.tabs.sendMessage(tab.id, {event:"cancel", data: data});
//             }
//         });
//     });
// })

document.getElementById('messageDeleted').addEventListener('click', function() {
    var inputElement = document.getElementById('messageDeleteCounter');

        var messageDeleteCount = Number(inputElement.value);
    // Send message to the background script
    chrome.runtime.sendMessage({ action: 'messageDeleted',data: messageDeleteCount});
  });

function navigate(url){
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.update(tabs[0].id, { url });
    });
  }