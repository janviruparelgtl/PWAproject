import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import webpush from 'web-push';


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

const url = "https://node-project-011019.herokuapp.com/"
class App1 extends Component {
  state = {
    items: [],
    loading: true,
    todoItem: '',
    offline: !navigator.onLine,
    error: '',
  }
  componentWillMount() {
    window.addEventListener('online', this.setOfflineStatus);
    window.addEventListener('offline', this.setOfflineStatus);
  }

  setOfflineStatus = () => {
    this.setState({
      offline: !navigator.onLine
    })
    // if (this.state.offline == false) {
    //   var openRequest = indexedDB.open("test", 1);
    //   var dbExists = true;
    //   openRequest.onupgradeneeded = function (e){
    //     e.target.transaction.abort();
    //     dbExists = false;
    //   }
    //   if(dbExists){
    //   openRequest.onsuccess = function (e) {
    //     var db = e.target.result;
    //     console.log(db)
    //     var transaction = db.transaction(["users"], "readwrite");
    //     var store = transaction.objectStore("users");
    //     var request = store.getAllKeys();
    //     request.onsuccess = function () {
         
    //       if (request.result.length >= 1) {
    //         console.log("in loop")
    //         for (var i = 0; i < request.result.length; i++) {
    //           fetch(url + 'postitems.json', {
    //             method: 'POST',
    //             body: JSON.stringify({ item: request.result[i] }),
    //             headers: {
    //               'Content-Type': 'application/json'
    //             }
    //           })
    //             .then(res => res.json())
    //           store.delete(request.result[i]);
    //         }
    //       }
    //       // if(request.result.length ===1) {
    //       //   console.log("in 1")
    //       //   fetch(url + 'postitems.json', {
    //       //     method: 'POST',
    //       //     body: JSON.stringify({ item: request.result }),
    //       //     headers: {
    //       //       'Content-Type': 'application/json'
    //       //     }
    //       //   })
    //       //     .then(res => res.json())
    //       //   store.delete(request.result);
    //       // }
    //     }
    //     db.close();
    //   }
    // }
    // }
   
  }

  componentDidMount() {
    fetch(url + 'items.json')
      .then(res => res.json())
      .then(items => {
        this.setState({ items, loading: false })
      })
  }

  addItem = (e) => {
    e.preventDefault();
    if (navigator.onLine === false) {
     
      var postData = this.state.todoItem;

      if ("indexedDB") {
        var openRequest = indexedDB.open("test", 1);

        openRequest.onupgradeneeded = function (e) {

          console.log("Upgrading...");
          var thisDB = e.target.result;
          if (!thisDB.objectStoreNames.contains("users")) {
            var userOS = thisDB.createObjectStore("users", { keyPath: "name" });
            userOS.createIndex('name', 'name')
          }
        }
        openRequest.onsuccess = function (e) {
          console.log("Success!");
          var db = e.target.result;
          var transaction = db.transaction(['users'], 'readwrite');
          var store = transaction.objectStore('users');
          var items = { name: postData }
          store.add(items);
          //readUser();
        }
        openRequest.onerror = function (e) {
          console.log("Error" + e);
        }
      }
    }
    fetch(url + 'postitems.json', {
      method: 'POST',
      body: JSON.stringify({ item: this.state.todoItem }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(items => {
        if (items.error) {
          this.setState({ error: items.error })
        } else {
          this.setState({ items })
        }
      })
    this.setState({ todoItem: '' })
  }

  deleteItem = (itemId) => {
    fetch(url + 'deleteitems.json', {
      method: 'DELETE',
      body: JSON.stringify({ id: itemId }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(items => {
        this.setState({ items })
      })
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

  render() {
    return (
      <div className="App">
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
          <form className="form-inline my-3" onSubmit={this.addItem}>
            <div className="form-group mb-2 p-0 pr-3 col-8 col-sm-10">
              <input
                className="form-control col-12"
                placeholder="what do you need to add?"
                value={this.state.todoItem}
                onChange={e => this.setState({ todoItem: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-outline-primary text-dark">
              Add
              </button>
          </form>
          {this.state.loading && <p>Loading ....</p>}
          {
            !this.state.loading && this.state.items.length === 0 &&
            <div className="alert alert-secondary">
              No items- all done!
            </div>
          }
          {
            !this.state.loading && this.state.items &&
            <table className="table table-striped">
              <tbody>
                {
                  this.state.items.map((item, index) => {
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
            this.state.error && this.state.offline &&
            <span className="text-danger">{this.state.error}</span>
          }
        </div>
        <button onClick={this.subscribe} className="btn btn-outline-primary text-dark">
          Subscribe push notification
       </button>
        <button onClick={this.testPushMessage} className="btn btn-outline-primary text-dark">
          Push notification Message
       </button>
      </div>
    );
  }
}

export default App1;
