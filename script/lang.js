function changeLanguage() {
    const textIDs = Object.keys(config.elements);
    const language = config.selectedLanguage;
    // use for...of 
    for (const textID of textIDs) {
        const elements = document.querySelectorAll(`[text="${textID}"]`);
        
        for (const element of elements) {
            if (config.elements[textID].type === "text") element.innerHTML = config.elements[textID][language];
            else if (config.elements[textID].type === "src") element.src = config.elements[textID][language];
        }
    }
}