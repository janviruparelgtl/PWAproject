import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getProductData, addProduct, deleteProductData } from '../actions/productAction';
import logo from '../logo.svg';
import axios from 'axios';
import webpush from 'web-push';
import { Link } from 'react-router-dom';
import { BulletList } from 'react-content-loader'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

class Products extends Component {
  constructor(props) {
    super(props)

    this.state = {
      productData: [],
      todoItem: '',
      loading: true,
      offline: !navigator.onLine,
      showErrorMessage: ''
    }

  }
  addItem = (e) => {
    e.preventDefault();
    var postProductData = this.state.todoItem;
    this.props.addProduct(postProductData);
    this.setState({
      todoItem: ''
    })
  }

  deleteItem = (itemId) => {
    this.props.deleteProductData(itemId);
  }
  componentWillMount() {
    this.props.getProductData();
    window.addEventListener('online', this.setOfflineStatus);
    window.addEventListener('offline', this.setOfflineStatus);
  }
  setOfflineStatus = () => {
    this.setState({
      offline: !navigator.onLine
    })

    if (this.state.offline === false) {
      var openRequest = indexedDB.open("test", 1);
      var dbExists = true;
      openRequest.onupgradeneeded = function (e) {
        e.target.transaction.abort();
        dbExists = false;
        console.log("DB not exists");
      }
      if (dbExists) {
        openRequest.onsuccess = function (e) {
          var db = e.target.result;
          var transaction = db.transaction("users", "readwrite");
          var store = transaction.objectStore("users");
          var request = store.getAllKeys();
          request.onsuccess = function () {
            if (request.result.length >= 1) {
              for (var i = 0; i < request.result.length; i++) {
                axios.post("https://node-project-011019.herokuapp.com/postitems.json", { item: request.result[i] })
                  .then(res => {
                    const postData = res.data;
                  });
                //store.delete(request.result[i]);
              }
            }
          }
          db.close();
        }
        window.indexedDB.deleteDatabase('test', 1);
      }

    }
  }
  subscribe = () => {
    const vapidKeys = webpush.generateVAPIDKeys();
    const publicKey = vapidKeys.publicKey;
    global.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    }).then(sub => {
      console.log("Subscribed!")
    }).catch(error => {
      console.log("Did not subscribed")
    })
  }

  testPushMessage = () => {
    global.registration.showNotification('Test Notification', {
      body: 'Success!',
      icon: '/images/icons/icon-128x128.png'
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.productData !== nextProps.prodArr) {
      this.setState({ productData: nextProps.prodArr, loading: nextProps.flag })
    }
    if (this.state.showErrorMessage !== nextProps.connectionError) {
      this.setState({
        showErrorMessage: nextProps.connectionError
      })
    }
  }
  render() {
    return (
      <div>
        {
          this.state.offline ?
            <nav className="navbar navbar-light bg-dark">
              <span className="navbar-brand mb-0 h1 text-light">
                <img src={logo} className="App-logo" alt="logo" />
                Todo List
              </span>
              <span className="badge badge-danger my-3">Offline</span>
            </nav>
            :
            <nav className="navbar navbar-light bg-light">
              <span className="navbar-brand mb-0 h1">
                <img src={logo} className="App-logo" alt="logo" />
                Todo List
              </span>
            </nav>
        }
        <div className="px-3 py-2">
          <Link to="/" className="btn btn-outline-primary text-dark mr-2 mb-2">Home</Link>
          <form className="form-inline my-3" onSubmit={this.addItem}>
            <div className="form-group  col-8 col-sm-10">
              <input
                className="form-control col-12"
                placeholder="what do you need to add? "
                value={this.state.todoItem}
                onChange={e => this.setState({ todoItem: e.target.value })}
              />
            </div>
            <div className="form-group col-4 col-sm-2">
              <button type="submit" className="btn btn-outline-primary text-dark">
                Add
              </button>
            </div>
          </form>
          {this.state.loading &&
            <BulletList speed={1} primaryColor="rgba(180,220,350,80)" style={{ width: '100%', height: '100px' }} secondaryColor="rgba(0,0,0,0.12)" />
            // <div class="main"><div class="spinner-1"></div></div>
          }
          {
            !this.state.loading && this.state.productData.length === 0 &&
            <div className="alert alert-secondary">
              No items- all done!
            </div>
          }
          {
            !this.state.loading && this.state.productData &&
            <table className="table table-striped">
              <tbody>
                {
                  this.state.productData.map((item, index) => {
                    return (
                      <tr key={item.id} className="row">
                        <td className="col-1">{index + 1}</td>
                        <td className="col-10">{item.item}</td>
                        <td className="col-1">
                          <button type="button" className="close" onClick={() => this.deleteItem(item.id)}>
                            <span >x</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          }
          {
            this.state.showErrorMessage && this.state.offline &&
            <span className="text-danger">{this.state.showErrorMessage}</span>
          }
        </div>
        <button onClick={this.subscribe} className="btn btn-outline-primary text-dark mr-2 mb-2">
          Subscribe push notification
       </button>
        <button onClick={this.testPushMessage} className="btn btn-outline-primary text-dark mb-2">
          Push notification Message
       </button>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  prodArr: state.productDetails.prodArr,
  flag: state.productDetails.flag,
  connectionError: state.productDetails.prodError
})

export default connect(mapStateToProps, { getProductData, addProduct, deleteProductData })(Products);
