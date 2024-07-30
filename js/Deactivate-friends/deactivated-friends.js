

document.getElementById("fetch_friends").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "friendLists" });
  });
  
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    if (message.action === "storeFriendListData") {
      const receivedGroupData = message.data?.edges;
      createFriendsListItems(receivedGroupData);
    }
  });

  function createFriendsListItems(friends) {
    const table = document.getElementById("friendstBodyData");
    table.innerHTML = '';
  
    friends.forEach((group) => {
      const { node } = group;
      if(node.__typename==="RestrictedUser"){

      const listItem = document.createElement("tr");
  
      listItem.innerHTML = `
        <td>
          <div class="image_td">
            <img src="${node.profile_picture.uri}">
            <label>${node.name}</label>
          </div>
        </td>
        <td>${node.gender}</td>
        <td>${node.id}</td>
        <td>
          <div class="form-check">
            <input type="checkbox" class="group-checkbox" data-group-id="${node.id}" data-group-name="${node.name}">
          </div>
        </td>
      `;
      table.appendChild(listItem);
    }

    });
  }

  document
  .getElementById("removeFriendsButton")
  .addEventListener("click", function (e) {
    const checkedBoxes = document.querySelectorAll(".group-checkbox:checked");
    const selectedFriends = Array.from(checkedBoxes).map((checkbox) => {
      return {
        id: checkbox.getAttribute("data-group-id"),
        name: checkbox.getAttribute("data-group-name"),
      };
    });
    chrome.runtime.sendMessage({
      action: "removeFriends",
      data: selectedFriends,
    });
  });
