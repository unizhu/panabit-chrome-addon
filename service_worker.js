chrome.windows.getCurrent(function (currentWindow) {
    chrome.tabs.query({active: true, windowId: currentWindow.id}, function(activeTabs) {
        
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (tab.url?.startsWith("chrome://")) return undefined;
            let _domains = {};
            //chrome.windows.getCurrent(function (currentWindow) { 
                chrome.storage.sync.get(['domains'], function(data) {
                    if (data.domains && data.domains.length) {
                        _domains = data.domains;
                    }
                });
            //});
            if (tab.active && ( tab.title === "Panabit" || _domains.hasOwnProperty((new URL(tab.url)).hostname ))) {
                chrome.scripting.executeScript({
                    target: {tabId: tabId, allFrames: true},
                    function: function initMac(){
                        if(document.title === "Panabit"){
                            const macAddressRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
                            console.log("Panabit");
                            let macTds = document.querySelectorAll('td[data-field="mac"]');
                            if(macTds.length === 0)  macTds = document.querySelectorAll('td[data-field="amac"]');
                            function appendTdChild(macTd,mac,response){
                                let node = document.createElement("p");
                                node.setAttribute("class","abtn");
                                node.setAttribute("style","font-size:10px;");
                                node.innerText = response;
                                macTd.appendChild(node);
                                _macJSON[mac] = response;
                                chrome.storage.sync.set({ _macJSON });
                            }
                            let _macJSON = {};
                            chrome.storage.sync.get(['_macJSON'], function(data) {
                                if (data._macJSON) {
                                    _macJSON = data._macJSON;
                                }
                            });
                            let _apiKey = null;
                            //chrome.windows.getCurrent(function () { 
                                chrome.storage.sync.get(['apiKey'], function(data) {
                                    if (data.apiKey) {
                                        _apiKey = data.apiKey;
                                    }
                                });
                            //});
                            let queryMAC = function(mac,macTd){
                                if(_macJSON.hasOwnProperty(mac) && _macJSON[mac] !== '') {
                                    console.log('mac-cached : ',mac);
                                    appendTdChild(macTd,mac,_macJSON[mac]); 
                                }
                                else{
                                    let xhr = new XMLHttpRequest();
                                    let requestURL = "https://api.maclookup.app/v2/macs/"+encodeURIComponent(mac)+"/company/name";
                                    if(_apiKey !== null) requestURL += "?apiKey="+_apiKey;
                                    //xhr.open("GET", "https://api.macvendors.com/"+encodeURIComponent(mac), true);
                                    xhr.open("GET", requestURL, true);
                                    xhr.onreadystatechange = function () {
                                        if (xhr.status === 200) {
                                            if(macTd.childNodes.length>1) macTd.removeChild(macTd.lastChild);
                                            let response = xhr.responseText;
                                            appendTdChild(macTd,mac,response);
                                        }
                                    };
                                    xhr.send();
                                }
                            };

                            let delay = (milliseconds) => new Promise(resolve => setTimeout(function(){return resolve}(), milliseconds));

                            if(macTds.length > 0){
                                macTds.forEach(macTd => {
                                    let mac = macTd.innerText;
                                    //console.log(mac);
                                    if(mac !=='' && macAddressRegex.test(mac) && macTd.querySelector('p') == null) {
                                            (function() { 
                                                delay(2000).then(() => {
                                                    queryMAC(mac,macTd);
                                                });
                                            })();
                                            /*
                                            fetch("https://api.macvendors.com/"+encodeURIComponent(mac),{method: 'GET',
                                                        headers: {
                                                            'mode': 'no-cors',
                                                        }})
                                            .then(response => {
                                                console.log(response);
                                                let node = document.createElement("p");
                                                node.innerText = '(' + response.text() + ')';
                                                macTd.appendChild(node);
                                                //macTd.innerText += '(' + response.text() + ')';
                                            })
                                            .catch(error => {
                                                console.log(error)
                                            });
                                            */
                                        //};
                                    }
                                });
                            }
                        }
                    }
                });
            }
        });
        
    });
});