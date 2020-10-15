import {fetch_product, fetchProductByID} from "./common.js";
window.addEventListener('DOMContentLoaded',async (event) => {
    event.preventDefault();
    let user_login = 1;
    localStorage.setItem("user", user_login);
    var pageNumber = 1;

    let products = await fetch_product("GET", "products", pageNumber, "6");
    let render_html = renderHotProducts(products);
    let elementHotProducts = document.getElementById("hot-product");
    elementHotProducts ? (elementHotProducts.innerHTML = render_html) : null;
    let buttonPrev = document.getElementsByClassName("hot-products__link-pre") || null;
    let buttonNext = document.getElementsByClassName("hot-products__link-next") || null;
    let menuCart = document.getElementsByClassName("menu__cart-link") || null;
    
    // update number of product in cart
    showNumberOfProdInCart(user_login);

    // hide drop cart hover when haven't value 
    let cart = JSON.parse(localStorage.getItem("cart")) || {};
    if(cart[user_login] == undefined || Object.keys(cart[user_login]).length == 0){
        document.getElementsByClassName("menu__total")[0].style.display = "none";
    }
    
    // disable button previous 
    if(pageNumber == 1){
        applyDisabledButton(buttonPrev);
    }
    // click button next show hot products
    buttonNext[0]?.addEventListener("click",async function(event){
        event.preventDefault();
        loading(elementHotProducts);
        let products = await fetch_product("GET", "products", pageNumber + 1, "6");

        setTimeout(function(){
            let render_html = renderHotProducts(products);
            elementHotProducts.innerHTML = render_html;
            pageNumber++;

            if(products.length < 6) {
                applyDisabledButton(buttonNext);
            } 

            if(pageNumber > 1){
                applyEnabledButton(buttonPrev);
            }

            unLoading(elementHotProducts);
        }, 500);
        
    });
    // click button previous show hot products
    buttonPrev[0]?.addEventListener("click",async function(event){
        event.preventDefault();
        loading(elementHotProducts);
        applyEnabledButton(buttonNext);
        pageNumber--;

        if(pageNumber >= 1) {
            let products = await fetch_product("GET", "products", pageNumber, "6");

            setTimeout(() => {
                let render_html = renderHotProducts(products);
                elementHotProducts.innerHTML = render_html;
                unLoading(elementHotProducts);
            }, 500);

            if(pageNumber == 1) {
                applyDisabledButton(buttonPrev);
            }
        }
    });

    function applyDisabledButton(event) {
        if(event.length > 0){
            event[0].style.cursor = "no-drop";
            event[0].setAttribute("disabled", true);
        }
    }
    function applyEnabledButton(event) {
        event[0].style.cursor = "pointer";
        event[0].removeAttribute("disabled");
    }

    function renderHotProducts(values) {
        let result="";
    
        for(let value of values){
            result = result + `<div class="product-item"><a href="../../layouts/detail.html"><img class="product-item__img" src="${value.img}" alt="${value.title}"></a>
            <p class="product-item__price">${money(value.price)} Đ</p>
            <h3><a class="product-item__link-title" href="">${value.title}</a></h3>
            <div class="product-item__rate">
              <div class="product-item__point"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i></div>
              <p class="product-item__number-commands">(${value.command} Đánh giá)</p>
            </div>
            <div class="product-item__group-btn product-item__group-btn--disable"><button type="button" onclick="addToCart(${value.id})" class="product-item__link-buy add-to-cart product-item__link-btn">Mua Ngay</button><a class="product-item__link-detail product-item__link-btn" href="">Xem Chi Tiết</a></div>
          </div>`
        }
        
        return result;
    }
    
    function loading(event) {
        let getOldAttr = event.getAttribute("class");
        event.setAttribute('class',`loading ${getOldAttr}`);
    }
    function unLoading(event) {
        event.classList.remove("loading");
    }
    // add to cart
    document.addToCart = function(id) {
        event.preventDefault();
        let user_login = localStorage.getItem("user");
        //add product to cart
        addProductToCart(id, 1);

        // show number of product in cart 
        showNumberOfProdInCart(user_login);

        alert('Đã thêm 1 sản phẩm vào giỏ hàng!');
        
        // update product cart in sessionStorage
        getValHoverCart_AddSession(user_login);
    }
    function showNumberOfProdInCart(user_login) {
        let numberOfProdCart = calcProductInCart(user_login);
    
        let elementCart = document.getElementsByClassName('menu__cart-number');
        elementCart[0].innerText = numberOfProdCart;
    }
    function calcProductInCart() {
        let cartByUserLogin = getCartByUserLogin(user_login);
        let sum = 0;

        for(let item in cartByUserLogin) {
            sum += cartByUserLogin[item].quality;
        }

        return sum;
    }

    function getCartByUserLogin(id_user) {
        let cartByUserLogin;
        let cart = JSON.parse(localStorage.getItem("cart")) || {};
        if(cart != null) {

            for (const [key, value] of Object.entries(cart) ) {
                if(key == id_user){
                    cartByUserLogin = value;
                    break;
                }
            }
        }
        return cartByUserLogin;
    }

    function addProductToCart(id, quality) {
        event.preventDefault();
        let user_login = localStorage.getItem("user");
        let cartByUserLogin = getCartByUserLogin(user_login);

        // update quality if exists product in cart
        if(cartByUserLogin != undefined && cartByUserLogin[id] != undefined ) {
            quality = cartByUserLogin[id].quality + quality;
        } 

        // update value cart 
        let valAddToCart = { [id] : { quality : quality } };
        cartByUserLogin = {...cartByUserLogin, ...valAddToCart};
        // add product into cart in localstorage
        updateCartInLocal(user_login, cartByUserLogin);
    }

    var listProductInCart = [];
    getValHoverCart_AddSession(user_login);
    // get id from LocalStorage -> fetch_product_id -> assign quality into result product by id -> save sessionStorage
    async function getValHoverCart_AddSession(user_login) {
        let valueByUser = getCartByUserLogin(user_login) || {};

        const result = Object.entries(valueByUser).map(async (item) => {
            let value = await fetchProductByID(item[0]);
            let quality ={ quality : item[1].quality } ;
            value = {...value, ...quality};
            return value;
        });
        
        listProductInCart = await Promise.all(result);

        sessionStorage.setItem("cart-hover", JSON.stringify(listProductInCart));

        //load product fo hover cart
        loadProductHoverCart();

        // toggle drop down cart hover
        let cart = JSON.parse(localStorage.getItem("cart")) || {};
        if(cart[user_login] == undefined || Object.keys(cart[user_login]).length == 0){
            document.getElementsByClassName("menu__total")[0].style.display = "none";
        } else {
            document.getElementsByClassName("menu__total")[0].style.display = "block";
        }

        getProductForPageCart(user_login);
    }

    //function hover menu cart show product
    
    function loadProductHoverCart() {
        event.preventDefault();
        let getProductSession =JSON.parse(sessionStorage.getItem("cart-hover"));
        let result = getProductSession.reduce((intinial, item) => {
            return intinial += `<div class="block" >
            <img class="block__img" src=${item.img} alt="img">
            <div class="content">
              <h3 class="block__title">MÁY KHOAN BLACK  DECKER</h3>
              <p class="block__quality">${item.quality} x</p>
              <p class="block__price">${money(item.price)} Đ</p>
            </div>
            <div class="block__icon-close" ><button type="button" onclick=removeProduct(${item.id}) class="block__icon-link btn-remove-product-cart"><i class="fas fa-times"></i></button></div>
          </div>`;
        }, "");

        let menuCartDropDown = document.getElementsByClassName('menu__cart-wrapper');
        menuCartDropDown[0].innerHTML = result;

        let total = calcTotalMoney(getProductSession).toString();
        document.getElementsByClassName("menu__total-price")[0].innerHTML = `${money(total)} Đ`;
    };

    function calcTotalMoney(values) {
        return values.reduce((sum, item) => {
            let price = item.price.replaceAll(".", ",");
            let quality = item.quality;
            return sum + ( price * quality );
        }, 0);
    }

    function money(value) {
        let count = 1;
        let result = [];
        for(let i = value.length - 1; i >= 0; i-- ) {
            if(count % 3 == 0 && i >= 1 ) {
                result.unshift("." + value[i] );
            } else {
                result.unshift(value[i]);
            }
            count++;
        }
        return result.toString().replaceAll(",", '')
    }
    
    document.removeProduct = function(id) {
        event.preventDefault();
        // remove product in cart
        removeProductInCart(id);
    };
    // remove product in cart
    function removeProductInCart(id_product) {
        let getValInCart = getCartByUserLogin(user_login) || {};
    
        if( id_product in getValInCart ) {
            delete getValInCart[id_product];
        }
        
        // update cart into localstorage
        updateCartInLocal(user_login, getValInCart);

         //load cart
         getValHoverCart_AddSession(user_login);

         let cart = JSON.parse(localStorage.getItem("cart"));
 
         // show number of product in cart 
         showNumberOfProdInCart(user_login);
 
         if(Object.keys(cart[user_login]).length == 0) {
             document.getElementsByClassName("menu__total")[0].style.display = "none";
         }
         
         //reload product in page cart
         let shoppingCart = document.getElementsByClassName("shopping-cart__table");
         if(shoppingCart.length > 0) {
             getProductForPageCart(user_login);
         }
    }

    function updateCartInLocal(user_login, value) {
        let cart = JSON.parse(localStorage.getItem("cart")) || {};
        cart[user_login] = {...value};
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // menuCart[0]?.addEventListener("click", async function() {
    //     console.log(1234);

    // });
    // getProductForPageCart(user_login);
    async function getProductForPageCart(user_login) {
        let shoppingCart = document.getElementsByClassName("shopping-cart");
        let elementPageCheckout = document.getElementsByClassName("info-user-buy");
       
        if(shoppingCart.length > 0 || elementPageCheckout.length > 0) {
            let productInCart = getCartByUserLogin(user_login) || {};
            
            if(productInCart == undefined || Object.keys(productInCart).length == 0){
                document.getElementsByClassName("shopping-cart__table")[0].innerHTML = '<p class="breadcumb breadcumb--format">Giỏ hàng không có sản phẩm!</p>';
            } else {
                let renderHtml;
                if(shoppingCart.length > 0){
                    renderHtml = listProductInCart.reduce((result, item, index) =>{
                        let price = (item.price * item.quality).toString();
                        return result += `<tr>
                            <td>${ index + 1 }</td>
                            <td><img class="shopping-cart__img" src=${ item.img } alt=""></td>
                            <td>${item.title}</td>
                            <td>${money(item.price)}Đ</td>
                            <td>
                            <input class="quality" onchange=getValChangeQuality(this) data-id=${item.id} min="1" type="number" value=${ item.quality } />
                            </td>
                            <td class="total-money${item.id}">${ money(price) } Đ</td>
                            <td> 
                                <button type="button" class="block__icon-link btn-remove-product-cart btn-remove-product-cart--background" onclick=removeProduct(${item.id}) ><i class="fas fa-times icon-close"></i></button>
                            </td>
                        </tr>`;
                    },"");
                }else{
                    renderHtml = listProductInCart.reduce((result, item, index) =>{
                        let price = (item.price * item.quality).toString();
                        return result += `<tr>
                            <td>${ index + 1 }</td>
                            <td><img class="shopping-cart__img" src=${ item.img } alt=""></td>
                            <td>${item.title}</td>
                            <td> 
                            <input class="quality" onchange=getValChangeQuality(this) data-id=${item.id} disabled="disabled" type="number" value=${ item.quality } />
                            </td>
                            <td class="total-money${item.id}">${ money(price) } Đ</td>
                        </tr>`;
                    },"");
                }
    
                document.getElementById('table-cart').innerHTML = renderHtml;

                // update step and load price in table total
                if(shoppingCart.length > 0 ){
                    sessionStorage.setItem("step-checkout", 1);
                    loadPriceTableTotal(listProductInCart);
                }
            }
        }
        
        if(elementPageCheckout.length > 0){
            sessionStorage.setItem("step-checkout", 2);
        }
        checkStepBuyProduct();
    }
   
    function checkStepBuyProduct() {
        let step = sessionStorage.getItem("step-checkout");
        for(let i = 1; i <= parseInt(step); i++ ){
            document.getElementById(`step-buy${i}`)?.setAttribute("class", "block--active block");
            document.getElementById(`step-buy-bar${i}`)?.setAttribute("class", "bar--active bar");
        }
    }

    // load value price into table total money
    function loadPriceTableTotal(value) {
        let totalMoney = calcTotalMoney(value);
        document.getElementsByClassName("total__money")[0].innerHTML = `${money(totalMoney.toString())} Đ`;

        let vat = totalMoney * (5 /100);
        document.getElementsByClassName("total__vat")[0].innerHTML = `${money(vat.toString())} Đ`;

        let bill = totalMoney + vat;
        document.getElementsByClassName("total-pay")[0].innerHTML = `${money(bill.toString())} Đ`;
    }

    // plus, subtraction product in cart
    document.getValChangeQuality = function(event) {
        let idProduct = event.getAttribute('data-id');
        let quality = parseInt(event.value);
        var partten = /^[0-9]{1,3}$/;
        if(quality == 0){
            removeProductInCart(idProduct);
        }
        if(partten.test(quality) && quality > 0){
            let valueInCart = getCartByUserLogin(user_login);
            valueInCart[idProduct].quality =parseInt(quality);
            
            updateCartInLocal(user_login, valueInCart);
    
            let priceOfProductId;
            for(let i = 0; i < listProductInCart.length; i++){
                if(listProductInCart[i].id == idProduct){
                    listProductInCart[i].quality = parseInt(quality);
                    priceOfProductId = listProductInCart[i].price;
                }
            }

            loadPriceTableTotal(listProductInCart);
            showNumberOfProdInCart(user_login);
    
            // update price when update quality product id
            let classNameTotalMoney = `total-money${idProduct}`;
            let totalMoneyOfProduct = quality * priceOfProductId;
            let elementTotalMoney = document.getElementsByClassName(classNameTotalMoney)[0];
            elementTotalMoney.innerHTML = `${money(totalMoneyOfProduct.toString())} Đ`;
            event.style.border = "1px solid #ebebeb";
        }else{
            event.style.border = "1px solid red";
        }
    }

    document.clickSubmitFormUserCheckout = function(event) {
        sessionStorage.setItem("step-checkout", 3);
        window.location.assign("http://127.0.0.1:5000/layouts/payment.html");
    }

    document.clickPayMent = function(event){
        alert("Đơn hàng của bạn đã được đặt!");
        let cart = JSON.parse(localStorage.getItem("cart")) || {};
        cart[user_login] = {};
        localStorage.setItem("cart", JSON.stringify(cart));
        window.location.assign("./home.html")
    }
    document.onCheckTransport = function(){
        let elementPayMent = document.querySelectorAll(".form .form__transport .payment__detail");
        elementPayMent[0]?.remove();
        
        let element = document.querySelector("input[name=transport]:checked").parentNode;
        let div = document.createElement("div");
        div.className = "payment__detail";
        
        let values = JSON.parse(sessionStorage.getItem("cart-hover")) || [];
        let items = values.reduce((value, item) => {
            return value += `<li class="payment__detail-item">${item.quality} x ${item.title}</li>`
        }, []);
        let redenHtml = `<p class="payment__detail-title payment__detail-title--color">Giao vào Thứ tư, 14/10</p>
        <ul class="payment__detail-group">
        ${items}
        </ul>
        <p class="payment__detail-title">Giao tiêu chuẩn </p><span class="payment__detail-cost">29.000 Đ</span>`;
        element.append(div);
        document.getElementsByClassName("payment__detail")[0].innerHTML = redenHtml;
    }
    
})
//  // bind an event listener to the keydown event on the window
window.addEventListener('keydown', function (event) {
    let elementShoppingCart = document.getElementsByClassName("shopping-cart");
    if ( (event.keyCode === 189 || event.keyCode === 187) && elementShoppingCart.length > 0 ) {
        // prevent default behaviour
        event.preventDefault();
    }

});

