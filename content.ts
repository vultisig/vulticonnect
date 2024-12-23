chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message from background script:", message);

  if (message.greeting) {
    sendResponse({ reply: "Hello from content script!" });
  }
});

interface Window {
  vultiConnect: { getLog: () => void };
}

const vultiConnect = {
  getLog: (): void => {
    console.log("content");
  },
};

window.vultiConnect = vultiConnect;

console.log(window.vultiConnect);
console.log(chrome.runtime);
