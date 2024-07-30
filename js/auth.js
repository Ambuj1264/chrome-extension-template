// Add event listeners to start and stop buttons.
function checkAuthToken() {
    chrome.storage.sync.get(["token"], function(result) {
        const token = result?.token;
        if(!token){
            window.location.href ="login.html"
        }
      });

  }
  window.onload = function () {
    checkAuthToken();
    userName();
  };
  
  document.getElementById("logout").addEventListener("click", ()=>{
    chrome.storage.sync.clear()
    localStorage.clear();
    window.location.href = 'login.html';
  });

  function userName(){
  var userData= localStorage.getItem("USER_DATA");
  var name= JSON.parse(userData).name;
    document.getElementById("userName_id").innerHTML = name;
  }