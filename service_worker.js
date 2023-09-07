chrome.windows.getCurrent(function (currentWindow) {
    chrome.tabs.query({active: true, windowId: currentWindow.id}, function(activeTabs) {
        
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (tab.url?.startsWith("chrome://")) {
                console.log("chrome:// detected");
                return undefined;
            } 
            //console.log("tab.title",);      
            if (tab.active && tab.title.startsWith("Panabit")) {
                chrome.scripting.executeScript({
                    target: {tabId: tabId, allFrames: true},
                    function: function initPanabit(tab){
                            let _domains = {}; 
                            function getSyncData(tab) {
                                return new Promise((resolve, reject) => {
                                    chrome.storage.local.get(['domains'], function(data) {
                                        if (data.domains && data.domains.length) {
                                            _domains = data.domains;
                                            resolve(_domains);             
                                        }
                                    });
                                });
                            }
                            getSyncData(tab)
                            .then((result) => {
                                //console.log("Operation completed:", result);
                                console.log("domain detected",_domains);
                                if(_domains.indexOf(window.location.hostname) < 0){
                                //if(!(_domains.indexOf((new URL(tab.url)).hostname ) > -1)){
                                    console.log("not panabit");
                                    return undefined;
                                }
                                else {
                                    console.log("panabit");
                                    const macAddressRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
                                    let macTds = document.querySelectorAll('td[data-field="mac"]');
                                    if(macTds.length === 0)  macTds = document.querySelectorAll('td[data-field="amac"]');
                                    let hostTds = document.querySelectorAll('td[data-field="host"],td[data-field="req_obj"]');
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
                                    chrome.storage.sync.get(['apiKey'], function(data) {
                                        if (data.apiKey) {
                                            _apiKey = data.apiKey;
                                            //console.log('apiKey : ',_apiKey);
                                        }
                                    });
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
                                    if(hostTds.length > 0) {
                                        hostTds.forEach(hostTd => {
                                            let host = hostTd.innerText;
                                            if(host !=='' && /^[a-zA-Z0-9-]{1,63}(\.[a-zA-Z0-9-]{1,63})+$/.test(host) 
                                                && host.startsWith("10.") === false && host.startsWith("192.168.") === false 
                                                && host.startsWith("172.") === false) {
                                                (function() { 
                                                    let node = document.createElement("p");
                                                    let virusTotal = document.createElement("a");
                                                    virusTotal.setAttribute("href","https://www.virustotal.com/gui/domain/"+encodeURIComponent(host));
                                                    virusTotal.setAttribute("target","_blank");
                                                    virusTotal.innerText = "Check On VirusTotal";
                                                    virusTotal.setAttribute("class","abtn");
                                                    virusTotal.setAttribute("style","font-size:10px;");
                                                    node.appendChild(virusTotal);
                                                    if(hostTd.querySelectorAll('p') > 0) hostTd.removeChild(hostTd.lastChild);
                                                    hostTd.appendChild(node);
                                                })();
                                            }
                                        });
                                    }
                                }
                            })
                            .catch((error) => {
                                console.error("Load Panabit Config Error:", error);
                            }); 
                        //}
                    }
                });
            }
        });
        
    });
});