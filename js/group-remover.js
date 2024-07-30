

document.getElementById("fetch_groups").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "fetchGroups" });
});

// Function to create a list item for each group
function createGroupListItems(groups) {
  console.log("groups",groups);
  const table = document.getElementById("grouptBodyData");
  table.innerHTML = '';

  groups.forEach((group) => {
    const { node } = group;
    const listItem = document.createElement("tr");

    listItem.innerHTML = `
      <td>
        <div class="image_td">
          <img src="${node.profile_picture.uri}">
          <label>${node.name}</label>
        </div>
      </td>
      <td>${new Date(node.viewer_last_visited_time * 1000).toLocaleString()}</td>
      <td>${node.id}</td>
      <td>
        <div class="form-check">
          <input type="checkbox" class="group-checkbox" data-group-id="${node.id}" data-group-name="${node.name}">
        </div>
      </td>
    `;
    table.appendChild(listItem);
  });
}


document
  .getElementById("removeGroupsButton")
  .addEventListener("click", function (e) {
    const checkedBoxes = document.querySelectorAll(".group-checkbox:checked");
    const selectedGroups = Array.from(checkedBoxes).map((checkbox) => {
      return {
        id: checkbox.getAttribute("data-group-id"),
        name: checkbox.getAttribute("data-group-name"),
      };
    });
    chrome.runtime.sendMessage({
      action: "deleteGroups",
      data: selectedGroups,
    });
  });

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(message,"message")
  if (message.action === "storeGroupData") {
    const receivedGroupData = message.data?.edges;
    createGroupListItems(receivedGroupData);
  }
});




