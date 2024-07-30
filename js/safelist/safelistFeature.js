var imported = document.createElement("script");
imported.src = chrome.runtime.getURL("./../envirement/env.js");

let extensionId;
let GRAPHQL_BASE_URL;
function scriptLoaded() {
  console.log("Data from Other File in file2:", GRAPHQL_BASE_URL);
}

imported.addEventListener("load", function () {
  extensionId = window.extensionId;
  if (extensionId === undefined) {
    import(chrome.runtime.getURL("./../envirement/env.js")).then((module) => {
      extensionId = module.extensionId;
      GRAPHQL_BASE_URL = module.GRAPHQL_BASE_URL;
      scriptLoaded();
    });
  } else {
    scriptLoaded();
  }
});

document.head.appendChild(imported);

document.getElementById("fetch_friends").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "friendLists" });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "storeFriendListData") {
    const receivedGroupData = message.data?.edges;
    createFriendsListItems(receivedGroupData);
  } else {
    toast(
      "Are you sure you are logged with facebook/ no data found",
      "error",
      "red"
    );
  }
});

async function createFriendsListItems(friends) {
  if (!friends.length) {
    toast(
      "Are you sure you are logged with facebook/ no data found",
      "error",
      "red"
    );
  }
  const url = "https://fb-tool-node.socialmotion.biz/graphql";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
                    query GetAllSafeListFriends {
                      getAllSafeListFriends {
                        _id
                        safeListuserId
                        name
                        image
                        gender
                        isDeleted
                      }
                    }
                  `,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      const resultData = responseData.data?.getAllSafeListFriends;
      const filteredFriends = friends.filter((friend) => {
        return !resultData.some(
          (dataItem) => dataItem?.safeListuserId === friend?.node.id
        );
      });
      const table = document.getElementById("friendstBodyData");
      table.innerHTML = "";
      filteredFriends.forEach((group) => {
        const { node } = group;
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
            <input type="checkbox" class="group-checkbox" data-group-id="${node.id}" data-group-name="${node.name}" data-group-img="${node.profile_picture.uri}" data-group-gender="${node.gender}">
          </div>
        </td>
      `;
        table.appendChild(listItem);
      });
    } else {
      throw new Error("Network response was not ok.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

document
  .getElementById("addToSaflist")
  .addEventListener("click", async function (e) {
    const checkedBoxes = document.querySelectorAll(".group-checkbox:checked");
    const selectedFriends = Array.from(checkedBoxes).map((checkbox) => {
      return {
        id: checkbox.getAttribute("data-group-id"),
        name: checkbox.getAttribute("data-group-name"),
        gender: checkbox.getAttribute("data-group-gender"),
        image: checkbox.getAttribute("data-group-img"),
      };
    });
    if (selectedFriends.length <= 0) {
      toast("Please add the user", "error", "red");
      return false;
    }
    const url = "https://fb-tool-node.socialmotion.biz/graphql";
    const data = {
      input: selectedFriends,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
        mutation CreateSafelistFriends($input: [safeUsersInupt]) {
            createSafelistFriends(input: $input) {
              _id
              safeListuserId
              name
              image
              gender
            }
          }
        `,
          variables: data,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const resultData = await responseData.data;

        if (resultData?.createSafelistFriends?.length) {
          //   alert("User saved in Safelist");
          toast("User saved in Safelist", "success", "#00FF4C");
          window.location.reload();
        } else {
          //   alert("Something went wrong");
          toast("Something went wrong", "error", "red");
        }
      } else {
        throw new Error("Network response was not ok.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

window.onload = async function () {
  const url = "https://fb-tool-node.socialmotion.biz/graphql";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
                  query GetAllSafeListFriends {
                    getAllSafeListFriends {
                      _id
                      safeListuserId
                      name
                      image
                      gender
                      isDeleted
                    }
                  }
                `,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      const resultData = responseData.data;
      if (resultData?.getAllSafeListFriends?.length) {
        FriendsListItems(resultData.getAllSafeListFriends);
      }
    } else {
      throw new Error("Network response was not ok.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

$(document).ready(function () {
  // Click event for the "Select All" button
  $("#selectAllCheckbox").on("click", function () {
    const isChecked = $(this).prop("checked");
    $(".group-checkbox").prop("checked", isChecked);
    // Select all checked checkboxes with class "group-checkbox" and retrieve their IDs
    var selectedIds = $(".group-checkbox:checked")
      .map(function () {
        return this.id;
      })
      .get();

    removeSafeList(selectedIds);
  });

  $("#removeFromSafeList").on("click", function () {
    const selectedIds = getSelectedCheckboxIds();
    removeSafeList(selectedIds);
  });
});
function updateSafeList() {
  const selectedIds = getSelectedCheckboxIds();
  // You can perform additional actions here if needed
  console.log(selectedIds);
}

function getSelectedCheckboxIds() {
  return $(".group-checkbox:checked")
    .map(function () {
      return this.id;
    })
    .get();
}

function removeSafeList(selectedIds) {
  const newSelectedIds = selectedIds.filter((id) => {
    return id !== "";
  });

  document
    .getElementById("removeFromSafeList")
    .addEventListener("click", async () => {
      if (!newSelectedIds.length) {
        toast("Please add the user", "error", "red");
        setTimeout(() => {}, 2000);
      }
      const url = "https://fb-tool-node.socialmotion.biz/graphql";
      const data = {
        ids: newSelectedIds,
      };
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
                        mutation RemoveFromSafelist($ids: [String]) {
                            removeFromSafelist(ids: $ids) {
                                _id
                                safeListuserId
                                name
                                image
                                gender
                                isDeleted
                            }
                        }
                    `,
            variables: data, // Include variables here
          }),
        });

        if (response.ok) {
          const responseData = await response.json();
          const resultData = responseData.data;
          if (resultData?.removeFromSafelist?.length) {
            // alert("Data deleted successfully");
            toast("Data deleted successfully", "success", "#00FF4C");
            window.location.reload();
            return false;
          }
        } else {
          throw new Error("Network response was not ok.");
        }
      } catch (error) {
        console.error("Error:", error);
        // Handle errors here
      }
    });
}
document.getElementById("searchId").addEventListener("keypress", async (e) => {
  const searchData = document.getElementById("searchId").value;
  if (searchData) {
    if (e.key === "Enter") {
      const url = "https://fb-tool-node.socialmotion.biz/graphql";
      const data = {
        data: searchData,
      };
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
            query FilterTheSaftListUser($data: String!) {
              filterTheSaftListUser(data: $data) {
                _id
                safeListuserId
                name
                image
                gender
                isDeleted
              }
            }
                    `,
            variables: data,
          }),
        });

        if (response.ok) {
          const responseData = await response.json();
          const resultData = responseData.data;
          FriendsListItems(resultData?.filterTheSaftListUser);
        } else {
          throw new Error("Network response was not ok.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  } else {
    const url = "https://fb-tool-node.socialmotion.biz/graphql";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
                  query GetAllSafeListFriends {
                    getAllSafeListFriends {
                      _id
                      safeListuserId
                      name
                      image
                      gender
                      isDeleted
                    }
                  }
                `,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const resultData = responseData.data;
        if (resultData?.getAllSafeListFriends?.length) {
          FriendsListItems(resultData.getAllSafeListFriends);
        }
      } else {
        throw new Error("Network response was not ok.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
});

function FriendsListItems(friends) {
  console.log(friends, "ffinedas");
  const table = document.getElementById("safeListBodyData");
  table.innerHTML = "";

  friends.forEach((friend) => {
    const listItem = document.createElement("tr");

    listItem.innerHTML = `
          <td>
            <div class="image_td">
              <img src="${friend.image}" >
              <label>${friend.name}</label>
            </div>
          </td>
          <td>${friend.gender ? friend.gender : "NA"}</td>
          <td>${friend.safeListuserId}</td>
          <td>
            <div class="form-check">
              <input type="checkbox" id=${
                friend._id
              } class="group-checkbox" data-group-id="${
      friend._id
    }" data-group-name="${friend.name}" data-group-img="${
      friend.image
    }" data-group-gender="${friend.gender}">
            </div>
          </td>
        `;
    table.appendChild(listItem);
  });
}

function toast(heading, icon, color) {
  $.toast({
    text: "", 
    heading: heading, 
    icon: icon, 
    showHideTransition: "fade", 
    allowToastClose: true, 
    hideAfter: 3000, 
    stack: 5, 
    position: "top-right",

    textAlign: "left", 
    loader: true, 
    loaderBg: color,
    beforeShow: function () {}, 
    afterShown: function () {},
    beforeHide: function () {}, 
    afterHidden: function () {}, 
  });
}
