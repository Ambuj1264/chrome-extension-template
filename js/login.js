document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("exampleInputEmail1");
  const passwordInput = document.getElementById("exampleInputEmail2");
  const signInButton = document.getElementById("signInButton");
  emailInput.addEventListener("input", function () {
    validateEmail();
  });
  passwordInput.addEventListener("input", function () {
    validatePassword();
  });
  signInButton.addEventListener("click", async function (event) {
    event.preventDefault(); // Prevent form submission for this example
    const isValidEmail = validateEmail();
    const isValidPassword = validatePassword();
    if (isValidEmail && isValidPassword) {
      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value.trim();
      console.log(email, "email");
      const url = "https://fb-tool-node.devtrust.biz/graphql";
      const data = {
        input: {
          email: email,
          password: password,
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
            query Login($input: CreateUserInput) {
              login(input: $input) {
                id
                email
                password
                mobileNumber
                isDeleted
                name
                token
              }
            }
            `,
            variables: data,
          }),
        });

        if (response.ok) {
          const responseData = await response.json();
          if (responseData.data.login) {
            localStorage.setItem(
              "AUTH_TOKEN",
              responseData?.data?.login?.token
            );
            localStorage.setItem(
              "USER_DATA",
              JSON.stringify({
                email: email,
                password: password,
                name: responseData?.data?.login?.name
              })
            );

            chrome.storage.sync.set({
              email: email,
              password: password,
              token: responseData?.data?.login?.token,
            });
            chrome.tabs.create({
              url: "chrome-extension://akhpjfmehfoheflpllkeaidgepbhjnjl/index.html",
            });
            chrome.tabs.query(
              { active: true, currentWindow: true },
              function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  email: email,
                  password: password,
                });
              }
            );
          } else {
            const loginError = document.getElementById("emailValidation");
            loginError.innerHTML = "Email or password are not matched";
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

  function validateEmail() {
    const email = emailInput.value.trim();
    const emailValidation = document.getElementById("emailValidation");
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
});

document.getElementById("forgot-password").addEventListener("click", () => {
  chrome.tabs.create({
    url: "chrome-extension://akhpjfmehfoheflpllkeaidgepbhjnjl/send-forget-password.html",
  });
});
