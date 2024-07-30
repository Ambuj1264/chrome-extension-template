chrome.runtime.onInstalled.addListener(()=> {
    console.log("extension installed");
    saveUserDetailsAndFetchDT();
});

chrome.action.onClicked.addListener(() => {
    console.log("check clicked");
    n();
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.type === "a")
        chrome.tabs.query({}, function(tabs) {
            const tabData = tabs.map(tab => {
                return {
                    url: tab.url,
                    title: tab.title
                };
            });
            sendResponse({status:true});
        });  
    return true;
});

chrome.runtime.onMessage.addListener(handleMessage);

function handleMessage(message, sender, sendResponse) {
    switch (message.action) {
        case 'messageDeleted':
            deletemessage(message);
            break;
        case 'fetchGroups':
            fetchGroups(0xb2963117f3e01);
            break;
        case 'deleteGroups':
            leaveFacebookGroups(message.data);
            break;
        case 'friendLists':
            getFriendsThroughGraphQL();
        case 'removeFriends':
            removeFriendsThroughGraphQL(message.data);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function deletemessage(message) {
    chrome.tabs.create({ url: 'https://www.facebook.com/messages' }, tab => {
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
            if (tabId === tab.id && changeInfo.status === 'complete') {
                triggerDeleteInContentScript(tabId, message);
                chrome.tabs.onUpdated.removeListener(listener);
            }
        });
    });
  };

function triggerDeleteInContentScript(tabId, message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabId, { action: "deleteMessages", data: message.data });
    });
}

function saveUserDetailsAndFetchDT() {
    chrome.cookies.get({ url: "https://facebook.com", name: "c_user" }, function (cookie) {
        if (!cookie) {
            console.log("Not logged in to Facebook");
            chrome.tabs.create({ url: "https://www.facebook.com/" });
            chrome.notifications.create({
                type: "basic",
                title: "Error",
                message: "Please Log on Facebook first!",
                iconUrl: "../static/favicon.png",
            });
            return;
        }

        chrome.storage.local.set({ c_user: cookie.value });
        console.log(cookie, "User Details Saved");

        // Fetch DT value
        fetch("https://www.facebook.com/0")
            .then(response => response.text())
            .then(function (responseText) {
                try {
                    let dtMatch = responseText.match(/DTSGInitData",\[\],\{"token":"(.*?)"/);
                    if (dtMatch && dtMatch.length > 1) {
                        let dtValue = dtMatch[1];
                        chrome.storage.local.set({ fb_token: dtValue });
                        console.log(dtValue, "User Details Saved");
                        console.log("DT value fetched:", dtValue);
                    } else {
                        throw new Error("DTSGInitData not found");
                    }
                } catch (error) {
                    console.error("Error in processing response:", error);
                }
            })
            .catch(error => {
                console.error("Error in fetching data:", error);
            });
    });
  };

function apiCall(requestData, callback) {
    chrome.storage.local.get(['c_user', 'fb_token'], function(result) {
        let cUser = result.c_user;
        let fbToken = result.fb_token;

        if (!cUser || !fbToken) {
            console.log("Required data not found in storage");
            return;
        }

        let formData = new FormData();
        formData.append("__user", cUser);
        formData.append("__a", 1);
        formData.append("dpr", 1);
        formData.append("fb_dtsg", fbToken);
        formData.append("fb_api_caller_class", "RelayModern");
        formData.append("fb_api_req_friendly_name", requestData.queryName);
        formData.append("doc_id", requestData.docId);
        formData.append("variables", requestData.variables);

        fetch("https://www.facebook.com/api/graphql/", {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => {
            console.log("Error: ", error.message);
        });
    });
}

function prepareApiRequestData(docId, queryName, variables) {
   
    return {
        docId: docId,
        queryName: queryName,
        variables: variables
    };
}

function fetchGroups(docId, cursor = null) {

    cursor = cursor ? `"${cursor}"` : null;
  const queryName =
  docId === 0xb2963117f3e01
      ? "GroupsCometTabGroupMembershipListPaginationQuery"
      : "GroupsLeftRailGroupsYouManagePaginatedQuery";
  const variables = `{"count":10,"cursor":${cursor},${
    docId === 0xb2963117f3e01 ? '"ordering":["viewer_added"],"scale":1}' : '"scale":1'
  }}`;
    let requestData = prepareApiRequestData(docId, queryName, variables);

    apiCall(requestData, function(data) {
        if (data && data.data) {
            let groupData = data.data.viewer.groups_tab.tab_groups_list;
            if (!groupData.edges.length && docId === 0xb2963117f3e01) {
                console.log("No groups found");
            } else {
                chrome.runtime.sendMessage({ action: "storeGroupData", data: groupData });
                // processGroups(groupData, docId);
            }
        } else {
            console.log("Error fetching data");
        }
    });
}

function leaveFacebookGroups(groupList) {
    chrome.storage.local.get(['c_user', 'fb_token'], function(result) {
        let cUser = result.c_user;
        let fbToken = result.fb_token;

        if (!cUser || !fbToken) {
            console.log("Required data not found in storage");
            return;
        }
    let currentGroup = groupList.shift();
    if (!currentGroup) {
        console.log("Finished, all groups processed.");
        return;
    }

    let variables = `{"input":{"group_id":"${currentGroup.id}","readd_policy":"ALLOW_READD","source":"comet_group_page","actor_id":"${cUser}","client_mutation_id":"6"}}`; 
    let requestData = prepareApiRequestData(0x72be322fd4fa1, "useGroupLeaveMutation", variables);

    apiCall(requestData, function(data) {
        fetchGroups(0xb2963117f3e01);
        if (data && data.data && data.data.group_leave) {
            console.log(`${currentGroup.name}: removed.`);
            leaveFacebookGroups(groupList); 
        } else {
            console.log(`${currentGroup.name}: failed to remove.`);
            leaveFacebookGroups(groupList); 
        }
    });
});
}

function getFriendsThroughGraphQL(cursor = null) {
    cursor = cursor ? `"${cursor}"` : null;
    const queryName = "FriendingCometFriendsListPaginationQuery";
    const variables = `{"count":30,"cursor":${cursor},"name":null,"scale":1}`;

    let requestData = prepareApiRequestData(4268740419836267, queryName, variables);

    apiCall(requestData, function(data) {
        if (data && data.data && data.data.viewer && data.data.viewer.all_friends) {
            let friendsData = data.data.viewer.all_friends;
            if (friendsData.page_info.has_next_page) {
                setTimeout(function () {
                    getFriendsThroughGraphQL(friendsData.page_info.end_cursor);
                }, getRandomInt(1500, 3000));
            }
            else {
                chrome.runtime.sendMessage({ action: "storeFriendListData", data: friendsData });
            }
        } else {
            console.log("Error fetching friends data");
        }
    });
}

function removeFriendsThroughGraphQL(friendsList) {
    chrome.storage.local.get(['c_user', 'fb_token'], function(result) {
        let cUser = result.c_user;
        let fbToken = result.fb_token;

        if (!cUser || !fbToken) {
            console.log("Required data not found in storage");
            return;
        }
    let currentFriends = friendsList?.shift();
    if (!currentFriends) {
        console.log("Finished, all friends processed.");
        return;
    }
  
    let variables = `{"input":{"source":"bd_profile_button","unfriended_user_id":"${currentFriends.id}","actor_id":"${cUser}","client_mutation_id":"2"},"scale":1}`; 
    let requestData = prepareApiRequestData(8752443744796374, "FriendingCometUnfriendMutation", variables);

    apiCall(requestData, function(data) {
        getFriendsThroughGraphQL();
        if (data && data.data && data.data.friend_remove) {
            console.log(`${currentFriends.name}: removed.`);
            removeFriendsThroughGraphQL(friendsList); 
        } else {
            console.log(`${currentFriends.name}: failed to remove.`);
            removeFriendsThroughGraphQL(friendsList); 
        }
    });
});
}