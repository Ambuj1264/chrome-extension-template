

document.addEventListener("DOMContentLoaded", function () {
    const emailInput = document.getElementById("forgetEmail");
    const signInButton = document.getElementById("sendEmailButton");
    emailInput.addEventListener("input", function () {
      validateEmail();
    });

    signInButton.addEventListener("click", async function (event) {
      event.preventDefault(); // Prevent form submission for this example
      const isValidEmail = validateEmail();
      if (isValidEmail) {
        const email = emailInput.value.trim().toLowerCase();
     
        const url = "https://fb-tool-node.socialmotion.biz/graphql";
        const data = {
            "email": email
          };
  
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
              query Query($email: String!) {
                sendMailForForgetPassword(email: $email)
              }
              `,
              variables: data,
            }),
          });
  
          if (response.ok) {
            const responseData = await response.json();
            if (responseData.data.sendMailForForgetPassword) {

                alert(responseData.data.sendMailForForgetPassword)
              chrome.tabs.create({
                url: "chrome-extension://obhadenjfdecndmabchdihkbjjbgemgi/forget-password.html",
              });
             
            } else {
              alert("The password reset email has already been dispatched. Please retry after a 10-minute interval")
            }
          } else {
            throw new Error("Network response was not ok.");
          }
        } catch (error) {
        alert(error.message)
          // Handle errors here
        }
      } else {
        console.log("Please fill in all required fields correctly.");
      }
    });
  
    function validateEmail() {
      const email = emailInput.value.trim();
      const emailValidation = document.getElementById("emailError");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email === "") {
        emailValidation.textContent = "Email address is required";
        return false;
      } else if (!emailRegex.test(email)) {
        emailValidation.textContent = "Please enter a valid email address";
        return false;
      } else {
        emailValidation.textContent = "";
        return true;
      }
    }
   
  });
  