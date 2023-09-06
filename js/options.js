document.addEventListener('DOMContentLoaded', function() {
    M.AutoInit(); // This initializes all Materialize components
});

function validateIPv6(address) {
    if (!/^[0-9a-fA-F]{1,4}:([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(address)) {
      return false;
    }
    return true;
}

function validateDomain(domain) {
    if (!/^[a-zA-Z0-9-]{1,63}(\.[a-zA-Z0-9-]{1,63})+$/.test(domain)) {
        return false;
    }
    return true;
}

function validateIPv4(address) {
    if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(address)) {
        return false;
    }
    return true;
}

function validateInput(input) {
    if (validateIPv6(input)) {
        return "ipv6";
    } else if (validateIPv4(input)) {
        return "ipv4";
    } else if (validateDomain(input)) {
        return "domain";
    } else {
        return false;
    }
}

function addDomainInput(value = "", removable = true) {
    const domainList = document.getElementById("domain-list");
    const newRow = document.createElement("div");
    newRow.className = "row";

    const newField = document.createElement("div");
    newField.className = "input-field col s5";

    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.className = "validate";
    newInput.value = value;
    newInput.onblur = function() { 
        if(!validateInput(this.value)) {
            this.classList.add("invalid");
            M.toast({html: 'Invalid IP or Domain!', classes: 'red darken-1'});
        } else {
            this.classList.remove("invalid");
        }
    }
    newField.appendChild(newInput);
    newRow.appendChild(newField);

    if (removable) {
        const removeButton = document.createElement("button");
        removeButton.className = "btn waves-effect waves-light red darken-2";
        removeButton.innerHTML = "Remove";
        removeButton.onclick = function() {
            domainList.removeChild(newRow);
        }
        newRow.appendChild(removeButton);
    }

    domainList.appendChild(newRow);
}

document.getElementById("add-domain").addEventListener("click", function() {
    addDomainInput();
});

document.getElementById("save").addEventListener("click", function() {
    const apiKey = document.getElementById("api_key").value;
    const domainInputs = document.getElementById("domain-list").querySelectorAll("input");
    const domains = Array.from(domainInputs).map(input => input.value);

    chrome.storage.sync.set({ apiKey, domains });
    if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
    } else {
        // Use Materialize toast component to show "saved" message
        M.toast({html: 'Saved!', classes: 'green darken-1'});
    }
});

window.onload = function() {
    chrome.storage.sync.get(['apiKey', 'domains'], function(data) {
        if (data.apiKey) {
            document.getElementById("api_key").value = data.apiKey;
        }
        if (data.domains && data.domains.length) {
            data.domains.forEach((domain, index) => {
                if (index === 0) {
                    document.querySelector("#domain-list input").value = domain;
                } else {
                    addDomainInput(domain);
                }
            });
        }
    });
    //TODO: Check if CROS extension is installed
    // const CROSID = 'lhobafahddgcelffkeicbaginigeejlf';

    // chrome.runtime.sendMessage(CROSID, 'version', response => {
    //     if (response) {
    //         console.log("Found CROS extension!");
    //         document.getElementById("cors-check").innerText = "Installed";
    //     }
    // });
}