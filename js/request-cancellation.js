

document.getElementById("start").addEventListener("click", dataValidate);
document.getElementById("stop").addEventListener("click", () => {
  sendReq("stop", null);
});

// Function to send a request to a specific tab
function sendReq(event, data) {
  chrome.storage.local.set({["task"]:"cancel"})
  chrome.tabs.create({ url: "https://www.facebook.com/friends/requests?type=sentreq" }, tab => {
    // Once the tab is updated & fully loaded, we will scrape the localStorage
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.sendMessage(tab.id, {event:"cancel", data: data});
        }
    });
});
}

// Attach input event listeners to all input and select elements
document.querySelectorAll("input, select").forEach(ele => {
  ele.addEventListener("input", handleInputChange);
});

function handleInputChange(e) {
  const { id, value, checked } = e.target;
  let savingVal = (id === "isOnbetweenFriends") ? checked : value;

  if (id === "betweenFriends") {
    document.getElementById("betweenReqShow").innerText = value;
  }

  chrome.storage.local.set({ [id]: savingVal });
}

// Load stored data and update UI accordingly
function loadData() {
  chrome.storage.local.get(null, (res) => {
    // Update elements with stored values or defaults
    const fields = ["friends", "minDelay", "maxDelay", "betweenFriends", "betweenDelay"];
    fields.forEach(field => {
      document.getElementById(field).value = res[field] || "";
    });

    document.getElementById("betweenReqShow").innerText = res.betweenReqShow || "";
    updateBetweenFriendsDisplay(res.isOnbetweenFriends);
  });
}
document.getElementById("isOnbetweenFriends").addEventListener("change", function() {
  const isChecked = this.checked;
  updateBetweenFriendsDisplay(isChecked);
});

// Function to update the display based on the checkbox state
function updateBetweenFriendsDisplay(isOn) {
  const displayStyle = isOn ? "flex" : "none";
  document.getElementById("betweenFriendsDiv").style.display = displayStyle;
  document.getElementById("isOnbetweenFriends").checked = !!isOn;
}


// Validate data before sending the request
function dataValidate() {
  const errors = [];
  const fields = ["friends", "minDelay", "maxDelay"];
  fields.forEach(field => {
    if (!document.getElementById(field).value) {
      errors.push(`Set ${field}`);
    }
  });

  const isOnbetweenFriends = document.getElementById("isOnbetweenFriends").checked;
  if (isOnbetweenFriends) {
    const betweenFields = ["betweenFriends", "betweenDelay"];
    betweenFields.forEach(field => {
      if (!document.getElementById(field).value) {
        errors.push(`Set ${field} for interval`);
      }
    });
  }

  if (errors.length) {
    document.getElementById("showError").innerText = errors.join(", ");
  } else {
    document.getElementById("showError").innerText = "";
    sendReq("start", gatherFormData());
  }
}

function gatherFormData() {
  return {
    task: "cancel", // or dynamically get the task
    friends: document.getElementById("friends").value,
    minDelay: document.getElementById("minDelay").value,
    maxDelay: document.getElementById("maxDelay").value,
    isOnbetweenFriends: document.getElementById("isOnbetweenFriends").checked,
    betweenFriends: document.getElementById("betweenFriends").value,
    betweenDelay: document.getElementById("betweenDelay").value,
  };
}

// Initialize data on page load
document.addEventListener("DOMContentLoaded", loadData);

// Scroll function for arrow button
document.getElementById("arrowBtn").addEventListener("click", () => {
  window.scroll(0, 5000);
});

function navigate(url){
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.update(tabs[0].id, { url });
  });
}