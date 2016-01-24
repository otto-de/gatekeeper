function handleParams(key, value, single_value) {
    key = encodeURI(key);
    value = encodeURI(value);
    var term_list = document.location.search.substr(1).split('&');

    var params = {}
    if(term_list != ""){
        for (i in term_list) {
            var pair = term_list[i].split('=')
            params[pair[0]] = pair[1].split(',')
        }
    }

    if(params[key]){
        index = params[key].indexOf(value);
        if (index > -1) {
             params[key].splice(index, 1);
        } else {
            if(single_value){
                params[key] = value
            } else {
                params[key].push(value)
            }
        }
    } else {
        params[key] = value
    }

    new_search = []
    for(key in params){
        if(params[key].length != 0){
            console.log("params[key]", params[key])
            var val = params[key]
            new_search.push([key, val].join('='))
        }
    }
    document.location.search = new_search.join('&');
}

document.getElementById('style_change').onclick = function() {
    handleParams("style", "night", true);
};