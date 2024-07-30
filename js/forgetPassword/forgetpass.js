document.addEventListener("DOMContentLoaded", function () {
    const tokenInput = document.getElementById("tokenId");
    const passwordInput = document.getElementById("forgetPassword");
    const confirmPasswordInput = document.getElementById("forgetConfirmPassword");

    const updateButton = document.getElementById("forget_Button");
    tokenInput.addEventListener("input", function () {
        validateToken();
    });
    passwordInput.addEventListener("input", function () {
      validatePassword();
    });
    confirmPasswordInput.addEventListener("input", function () {
        validateConfirmPassword();
    });
    updateButton.addEventListener("click", async function (event) {
      event.preventDefault(); // Prevent form submission for this example
      const isValidToken = validateToken();
      const isValidPassword = validatePassword();
      const isValidateConfirmPassword = validateConfirmPassword();
      if (isValidToken && isValidPassword && isValidateConfirmPassword) {
        const token = tokenInput.value.trim();
        const password = passwordInput.value.trim();
        const url = "https://fb-tool-node.socialmotion.biz/graphql";
        const data = {
          input: {
            refressToken: token,
            password: password,
            email:"",
          },
        };
  
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
              mutation FogetPassword($input: forgetInput) {
                fogetPassword(input: $input) {
                  id
                  email
                  password
                  mobileNumber
                  isDeleted
                  name
                }
              }
              `,
              variables: data,
            }),
          });
  
          if (response.ok) {
            const responseData = await response.json();
            if (responseData.data.fogetPassword) {
                alert("Password is updated successfully");

                chrome.tabs.query({ url: "chrome-extension://obhadenjfdecndmabchdihkbjjbgemgi/login.html" }, function (tabs) {
                    if (tabs.length > 0) {
                        // If the tab is already open, focus on it
                        chrome.tabs.update(tabs[0].id, { active: true });
                    } else {
                        // If the tab is not open, create a new one
                        chrome.tabs.create({
                            url: "chrome-extension://obhadenjfdecndmabchdihkbjjbgemgi/login.html",
                        });
                    }
                });
            } else if (responseData.data.errors.message) {
             alert(responseData.data.errors.message)
            }
            else{
                alert("Something went wrong");
            }
          } else {
            throw new Error("Network response was not ok.");
          }
        } catch (error) {
          console.error("Error:", error);
          // Handle errors here
        }
      } else {
        console.log("Please fill in all required fields correctly.");
      }
    });
  
    function validateToken() {
      const token = tokenInput.value.trim();
      const tokenValidation = document.getElementById("tokenValidationError");
      if (token === "") {
        tokenValidation.textContent = "token is required";
        return false;
      } else {
        tokenValidation.textContent = "";
        return true;
      }
    }
    function validatePassword() {
      const password = passwordInput.value.trim();
      const passwordValidation = document.getElementById("passwordValidation");
      if (password === "") {
        passwordValidation.textContent = "Password is required";
        return false;
      } else if (password.length < 8) {
        passwordValidation.textContent =
          "Password should be at least 8 characters long";
        return false;
      } else {
        passwordValidation.textContent = "";
        return true;
      }
    }
    function validateConfirmPassword() {
      const confirmPassword = confirmPasswordInput.value.trim();
      const password = passwordInput.value.trim();
      const confirmPasswordValidation = document.getElementById("confirmPasswordValidation");
      if (confirmPassword === "") {
        confirmPasswordValidation.textContent = "Confirm password is required";
        return false;
      } else if (confirmPassword.length < 8) {
        confirmPasswordValidation.textContent =
          "Password should be at least 8 characters long";
        return false;
      }  else if (!(confirmPassword === password)) {
        confirmPasswordValidation.textContent =
          "Password and confirm password are not matched";
        return false;
      } 
      
      else {
        confirmPasswordValidation.textContent = "";
        return true;
      }
    }
  });
