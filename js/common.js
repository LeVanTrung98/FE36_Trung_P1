const HOST = "http://localhost:3000/";

export function fetch_product(method, url, page = "", limit = "") {
    return new Promise(function (resolve, reject) {
        let url_format = (page && limit) ? `${HOST}${url}?_page=${page}&_limit=${limit}` : `${HOST}${url}`;
        let xhr = new XMLHttpRequest();
        xhr.responseType = "json";
        xhr.open(method, url_format);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status
            });
        };
        xhr.send();
    });
}

export function fetchProductByID(id) {
    return new Promise(function(resolve, reject){
        let xhr = new XMLHttpRequest();
        let url_format = `${HOST}products/${id}`;
        xhr.responseType = "json";
        xhr.open("GET", url_format);
        xhr.onload = function(){
            
            if(this.status >= 200 && this.status < 300 ) {
                resolve(xhr.response);
            } else {
                reject({
                    status : this.status
                });
            }
        }
        xhr.onerror = function () {
            reject({
                status: this.status,
            });
        };
        xhr.send();
    });
}