import { PRODUCT_RESULT_SUCCESS, PRODUCT_RESULT_ERROR } from "../constants/types";
// import { PRODUCT_RESULT_SUCCESS, POST_PRODUCT_SUCCESS,DELETE_PRODUCT_SUCCESS } from "../constants/types";
import axios from 'axios';
const url = "https://node-project-011019.herokuapp.com/"

export const getProductData = () => dispatch => {
    axios.get(url + `items.json`)
        .then(res => {
            const users = res.data;
            dispatch({
                type: PRODUCT_RESULT_SUCCESS,
                payload: users
            })
        })
};

export const addProduct = (addProdcutData) => dispatch => {
    axios.post(url + `postitems.json`, { item: addProdcutData })
        .then(res => {
            if (res.data.error) {
                if (indexedDB) {
                    var openRequest = indexedDB.open("test", 1);
                    openRequest.onupgradeneeded = function (e) {

                        console.log("Upgrading...");
                        var thisDB = e.target.result;
                        if (!thisDB.objectStoreNames.contains("users")) {
                            // var userOS = thisDB.createObjectStore("users", { keyPath: "name" });
                            thisDB.createObjectStore("users", { keyPath: "name" })
                            //userDB.createIndex('name', 'name')
                        }
                    }
                    openRequest.onsuccess = function (e) {
                        console.log("Success!");
                        var db = e.target.result;
                        var transaction = db.transaction(['users'], 'readwrite');
                        var store = transaction.objectStore('users');
                        var items = { name: addProdcutData }
                        store.add(items);
                        //readUser();
                        db.close();
                    }
                    openRequest.onerror = function (e) {
                        console.log("Error" + e);
                    }
                }
                dispatch({
                    type: PRODUCT_RESULT_ERROR,
                    payload: res.data.error
                })
            }
            else {
                const postData = res.data;
                dispatch({
                    type: PRODUCT_RESULT_SUCCESS,
                    payload: postData
                })
            }
        })
};

export const deleteProductData = (deleteData) => dispatch => {
    axios({
        method: 'DELETE',
        url: 'https://node-project-011019.herokuapp.com/deleteitems.json',
        data: {
            id: deleteData
        }
    }).then(res => {
        const finalData = res.data;
        dispatch({
            type: PRODUCT_RESULT_SUCCESS,
            payload: finalData
        })
    });
};

