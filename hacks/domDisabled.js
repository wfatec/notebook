const nativeCodeArray = ['XMLHttpRequest', 'fetch'];

nativeCodeArray.forEach(element => {
    window[element] = null;
});