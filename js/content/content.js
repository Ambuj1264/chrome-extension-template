let timer;
let isStop = false;

let message = {
  authMsg: "This extension to continuously working .",
  finished: "Finished",
  stopped: "Stopped",
  spam: '"Stopped Friends Adding" Facebook has detected your activity as spam, You can try again later',
  noFriends: "No Requests/Friends",
};

if (window.location.href.includes("type=sentreq")) {
  let i = 0;
  const timer = setInterval(() => {
    const cancelFriendBtn = document.querySelector(
      'div[class="xod5an3 xktsk01 x1d52u69 x14vqqas"]'
    )?.children[0];
    if (cancelFriendBtn) {
      cancelFriendBtn.click();
      clearInterval(timer);
    }
    if (i == 10) {
      cancelFriendBtn.click();
    }
    i++;
  }, 1000);
}

chrome.runtime.onMessage.addListener(function (req, res, sendResponse) {
  chrome.storage.local.get(null, async (storeRes) => {
    const apiRes = await chrome.runtime.sendMessage({ type: "a" });
    if (apiRes.status) {
      if (req.event == "delete") {
        confirmFriends(storeRes, req.event);
      } else if (req.event == "cancel") {
        cancelSentRequest(storeRes, req.event);
      }
    }

    if (req.event == "stop") {
      isStop = true;
    }
  });
  sendResponse(null);
});

function displayMsg(msg, status) {
  Swal.fire({
    icon: status,
    text: msg,
  });
}

function perDelay(min, max) {
  min = parseInt(min);
  max = parseInt(max);
  return new Promise((resolve, rej) => {
    var delay = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(delay);
    setTimeout(() => {
      resolve(true);
    }, delay * 1000);
  });
}

function beetBetweenDelay(delay) {
  return new Promise((resolve, rej) => {
    setTimeout(() => {
      resolve(true);
    }, delay * 1000);
  });
}

function isStopTask() {
  return new Promise((resolve, rej) => {
    if (isStop) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

async function auth() {
  const apiRes = await chrome.runtime.sendMessage({ type: "a" });
  return new Promise((resolve, rej) => {
    if (!apiRes.status) {
      Swal.fire({
        icon: "warning",
        text: message.authMsg,
        showCancelButton: true,
        confirmButtonText: "Yes, Continue!",
        cancelButtonText: "No, cancel!",
      }).then((result) => {
        if (result.isConfirmed) {
          console.log("confirmed result");
        } else {
          rej();
        }
      });
    } else {
      resolve(true);
    }
  });
}

function findElement(selector, parent) {
  return new Promise((resolve, reject) => {
    let i = 0;
    let findEleTimer = setInterval(() => {
      const element = parent
        ? parent.querySelector(selector)
        : document.querySelector(selector);
      if (element) {
        clearInterval(findEleTimer);
        resolve(element);
      }
      if (i == 10) {
        clearInterval(findEleTimer);
        reject();
      }
      i++;
    }, 1000);
  });
}

function finishedTask(totalFriends, i) {
  return new Promise((resolve, reject) => {
    if (totalFriends == i + 1) {
      displayMsg(message.finished, "success");
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

async function addFriends(savedData) {
  var totalFriends = parseInt(savedData.friends);
  var count = parseInt(savedData.betweenFriends);
  var mainDiv = document.querySelector(
    'div[class="x9f619 x1n2onr6 x78zum5 xdt5ytf x193iq5w xeuugli x2lah0s x1t2pt76 x1xzczws x1cvmir6 x1vjfegm"]'
  );

  for (let i = 0; i < totalFriends; i++) {
    if (await isStopTask()) {
      displayMsg(message.stopped, "success");
      break;
    }

    try {
      await auth();
    } catch (e) {
      break;
    }

    const doesThisPersonKnowYouDialogBox = document.querySelector(
      'div[class="x1n2onr6 x1ja2u2z x1afcbsf x78zum5 xdt5ytf x1a2a7pz x6ikm8r x10wlt62 x71s49j x1jx94hy x1qpq9i9 xdney7k xu5ydu1 xt3gfkd x104qc98 x1g2kw80 x16n5opg xl7ujzl xhkep3z x1n7qst7 xh8yej3"]'
    );
    if (doesThisPersonKnowYouDialogBox) {
      const cancelBtn = doesThisPersonKnowYouDialogBox.querySelector(
        'div[aria-label="Cancel" i]'
      );
      cancelBtn.click();
    }
    const isSpam = document.getElementsByClassName(
      "x1n2onr6 x1ja2u2z x1afcbsf xdt5ytf x1a2a7pz x71s49j x1qjc9v5 x1qpq9i9 xdney7k xu5ydu1 xt3gfkd x78zum5 x1plvlek xryxfnj xcatxm7 x1n7qst7 xh8yej3"
    )[0];
    if (isSpam) {
      displayMsg(message.spam, "warning");
      break;
    }

    const parentDiv = mainDiv.querySelector(
      'div[data-visualcompletion="ignore-dynamic" i]'
    );
    const actionBtn = parentDiv.querySelector(
      'div[class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x87ps6o x1lku1pv x1a2a7pz x9f619 x3nfvp2 xdt5ytf xl56j7k x1n2onr6 xh8yej3"]'
    );
    if (!actionBtn) {
      displayMsg(message.noFriends, "warning");
      break;
    }
    actionBtn.click();

    setTimeout(() => {
      parentDiv.remove();
    }, 1000);

    await perDelay(savedData.minDelay, savedData.maxDelay);

    if (await finishedTask(totalFriends, i)) break;

    if (count == i + 1 && savedData.isOnbetweenFriends) {
      count += count;
      await beetBetweenDelay(parseInt(savedData.betweenDelay));
    }
  }
}

async function confirmFriends(savedData, event) {
  var totalFriends = parseInt(savedData.friends);
  var count = parseInt(savedData.betweenFriends);
  var mainDiv = document.querySelector(
    'div[class="x2bj2ny x1afcbsf x78zum5 xdt5ytf x1t2pt76 x1n2onr6 x1cvmir6 xcoz2nd xxzkxad xh78kpn xojf56a x1r98mxo"]'
  );
  for (let i = 0; i < totalFriends; i++) {
    if (await isStopTask()) {
      displayMsg(message.stopped, "success");
      break;
    }

    try {
      await auth();
    } catch (e) {
      break;
    }

    const parentDiv = mainDiv.querySelector(
      'div[data-visualcompletion="ignore-dynamic" i]'
    );

    var actionBtn;
    if (event == "confirm") {
      actionBtn = parentDiv.querySelector('div[aria-label="Confirm" i]');
    } else if (event == "delete") {
      actionBtn = parentDiv.querySelector(
        'div[aria-label="Delete" i]:not([aria-disabled="true"])'
      );
    }

    if (!actionBtn) {
      displayMsg(message.noFriends, "warning");
      break;
    }
    actionBtn.click();
    // actionBtn.childNodes[0].style.backgroundColor = "red"

    setTimeout(() => {
      parentDiv.remove();
    }, 1000);

    await perDelay(savedData.minDelay, savedData.maxDelay);

    if (await finishedTask(totalFriends, i)) break;

    if (count == i + 1 && savedData.isOnbetweenFriends) {
      count += count;
      await beetBetweenDelay(parseInt(savedData.betweenDelay));
    }
  }
}

async function cancelSentRequest(savedData) {
  var totalFriends = parseInt(savedData.friends);
  var count = parseInt(savedData.betweenFriends);
  var cancellationCount = 0;
  var mainDiv = document.querySelector('div[aria-label="Sent requests" i]');
  var htmlCode = `<button class="sent-request-button">
  Cancel Pending Requests
  <div class="sent-request-information">${cancellationCount} cancellations</div>
</button>

<style>
.sent-request-button {
  background-color: #fd7543; 
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sent-request-button:hover {
  background-color: #FF5733;
}

.sent-request-information {
  font-size: 12px;
  color: white;
}
</style>`;

  mainDiv.insertAdjacentHTML("afterbegin", htmlCode);
  for (let i = 0; i < totalFriends; i++) {
    if (await isStopTask()) {
      displayMsg(message.stopped, "success");
      break;
    }

    try {
      await auth();
    } catch (e) {
      break;
    }

    const parentDiv = mainDiv.querySelector(
      'div[data-visualcompletion="ignore-dynamic" i]'
    );
    const actionBtn = parentDiv.querySelector(
      'div[aria-label="Cancel Request" i]'
    );

    if (!actionBtn) {
      displayMsg(message.noFriends, "warning");
      break;
    }
    actionBtn.click();
    setTimeout(() => {
      parentDiv.remove();
      cancellationCount++;
      document.querySelector(
        ".sent-request-information"
      ).innerText = `${cancellationCount} cancellations`;
    }, 1000);

    await perDelay(savedData.minDelay, savedData.maxDelay);

    if (await finishedTask(totalFriends, i)) break;

    if (count == i + 1 && savedData.isOnbetweenFriends) {
      count += count;
      await beetBetweenDelay(parseInt(savedData.betweenDelay));
    }
  }
}

async function unfriend(savedData) {
  var totalFriends = parseInt(savedData.friends);
  var count = parseInt(savedData.betweenFriends);
  var mainDiv =
    document.querySelector('div[aria-label="All Friends" i]') ||
    document.querySelector('div[aria-label="All friends" i]');
  for (let i = 0; i < totalFriends; i++) {
    if (await isStopTask()) {
      displayMsg(message.stopped, "success");
      break;
    }

    try {
      await auth();
    } catch (e) {
      break;
    }

    const parentDiv = mainDiv.querySelector(
      'div[data-visualcompletion="ignore-dynamic" i]'
    );
    var moreBtn;
    try {
      moreBtn = await findElement('div[aria-label="More" i]', parentDiv);
    } catch (e) {}

    try {
      moreBtn.click();
    } catch (e) {
      console.log(e);
    }

    const actionListMainDom = await findElement(
      'div[class="x1n2onr6 xcxhlts x1fayt1i"]',
      null
    );
    const actionList = actionListMainDom.querySelectorAll(
      'div[role="menuitem" i]'
    );
    actionList[actionList.length - 1].click();
    try {
      var actionBtn = await findElement('div[aria-label="Confirm" i]');
      actionBtn.click();
    } catch (e) {
      try {
        var actionBtn = await findElement('div[aria-label="Confirm" i]');
        actionBtn.click();
      } catch (e) {
        displayMsg(message.noFriends, "warning");
        break;
      }
    }
    setTimeout(() => {
      parentDiv.remove();
    }, 1000);
    await perDelay(savedData.minDelay, savedData.maxDelay);

    if (await finishedTask(totalFriends, i)) break;

    if (count == i + 1 && savedData.isOnbetweenFriends) {
      count += count;
      await beetBetweenDelay(parseInt(savedData.betweenDelay));
    }
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "deleteMessages") {
    setupFacebookMessagesCleaner(request.data);
  }
});

function setupFacebookMessagesCleaner(limit) {
  let strVar = `
        <div id="ird" style="position:fixed; opacity:1; width:100%; top:0; left:0; background-color:rgba(72, 155, 219, 1); color:white; box-shadow:5px 5px 50px #efefef; z-index:99999999999999; height:55px; font-family:tahoma;">
            <span id="donate"></span>
            <h2 style="text-align:center; color:white; font-size:18px; font-weight:500; margin:0; margin-top:17px;">
                Facebook Messages Cleaner <small>(<span id='num'> ........... </span>)</small>
            </h2>
            <button id="btnclose" style="float:right; margin-right:40px; cursor:pointer; background-color:#d9534f; color:white; border:1px solid maroon; margin-top:-25px; border-radius:5px; padding:4px; font-size:15px;">Close</button>
        </div>`;

  if (!document.querySelector("#ird")) {
    document.body.insertAdjacentHTML("afterbegin", strVar);
  }

  document.querySelector("#btnclose").addEventListener("click", function () {
    window.location.reload();
  });

  let dm = 0; // Number of deleted messages
  let tt = 0;

  let ssm = setInterval(function () {
    tt++;
    let numElements = document.querySelectorAll(
      "a[href*='/messages/t/']"
    ).length;
    document.querySelector(
      "#num"
    ).textContent = `Getting ${numElements} Messages. Please wait.`;
    if (tt === 5) {
      deletefbmessage();
      clearInterval(ssm);
    }
  }, 500);

  function deletefbmessage() {
    // Stop deletion process if the limit is reached
    if (dm >= limit) {
      document.querySelector(
        "#num"
      ).textContent = `Delete Finished. ${dm} Messages were Deleted.`;
      return;
    }

    let elms = Array.from(
      document.querySelectorAll("a[href*='/messages/t/']")
    ).map((elm) => {
      let parentRow = elm.closest('[role="row"]');
      if (getComputedStyle(parentRow).visibility !== "hidden") {
        return parentRow;
      }
    })[0];

    if (elms) {
      let button = elms.querySelector(".x10f5nwc.xi81zsa");
      if (button) {
        button.click();
        let s2 = setInterval(function () {
          let deleteBtn = Array.from(
            document.querySelectorAll('[role="menuitem"]')
          ).find((el) => el.textContent.includes("Delete"));
          if (deleteBtn) {
            deleteBtn.click();
            clearInterval(s2);
            let s3 = setInterval(function () {
              let confirmBtn = document.querySelector(
                ".n75z76so.ed17d2qt,.x1s688f.xtk6v10"
              );
              if (confirmBtn) {
                clearInterval(s3);
                elms.setAttribute("dfmsgs", "true");
                confirmBtn.click();
                dm++;
                if (dm < limit) {
                  setTimeout(deletefbmessage, 2000);
                } else {
                  document.querySelector(
                    "#num"
                  ).textContent = `Delete Finished. ${dm} Messages were Deleted.`;
                }
              }
            }, 500);
          }
        }, 500);
      }
    }
  }
}


