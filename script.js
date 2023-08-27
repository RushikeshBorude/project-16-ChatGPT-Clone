const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "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"; // Paste your API key here

const loadDataFromLocalstorage = () => {
    // Load saved chats and theme from local storage and apply/add on the page
    const themeColor = localStorage.getItem("themeColor");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>ChatGPT Clone</h1>
                            <p>Start a conversation and explore the power of AI.<br> Your chat history will be displayed here.</p>
                        </div>`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
}

const createChatElement = (content, className) => {
    // Create new div and apply chat, specified class and set html content of div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv; // Return the created chat div
}

const getChatResponse = async (incomingChatDiv) => {
    const API_URL = "https://api.openai.com/v1/completions";
    const pElement = document.createElement("p");

    // Define the properties and data for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: userText,
            max_tokens: 2048,
            temperature: 0.2,
            n: 1,
            stop: null
        })
    }

    // Send POST request to API, get response and set the reponse as paragraph element text
    try {
        const response = await (await fetch(API_URL, requestOptions)).json();
        pElement.textContent = response.choices[0].text.trim();
    } catch (error) { // Add error class to the paragraph element and set error text
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    }

    // Remove the typing animation, append the paragraph element and save the chats to local storage
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const copyResponse = (copyBtn) => {
    // Copy the text content of the response to the clipboard
    const reponseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(reponseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
    // Display the typing animation and call the getChatResponse function
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="data:image/png;base64,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" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
    // Create an incoming chat div with typing animation and append it to chat container
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim(); // Get chatInput value and remove extra spaces
    if(!userText) return; // If chatInput is empty return from here

    // Clear the input field and reset its height
    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="https://e7.pngegg.com/pngimages/550/997/png-clipart-user-icon-foreigners-avatar-child-face.png" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    // Create an outgoing chat div with user's message and append it to chat container
    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}

deleteButton.addEventListener("click", () => {
    // Remove the chats from local storage and call loadDataFromLocalstorage function
    if(confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

themeButton.addEventListener("click", () => {
    // Toggle body's class for the theme mode and save the updated theme to the local storage 
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {   
    // Adjust the height of the input field dynamically based on its content
    chatInput.style.height =  `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If the Enter key is pressed without Shift and the window width is larger 
    // than 800 pixels, handle the outgoing chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);