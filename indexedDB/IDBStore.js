const localDatabase = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
class IDBStore {
  constructor(config) {
    this.dbVersion = config.dbVersion
    this.dbName = config.dbName
    this.storeList = config.storeList
    this.db = null
  }

  open() {
    let dbVersion = localStorage.getItem(this.dbName + '-dbVersion') || 0
    if (dbVersion > this.dbVersion) {
      this.dbVersion = dbVersion
    }
    return new Promise((resolve, reject) => {
      const request = localDatabase.open(this.dbName, this.dbVersion)
      request.onsuccess = () => {
        this.db = request.result
        console.log('open database success')
        resolve()
      }
      request.onupgradeneeded = () => {
        console.log('version change')
        this.db = request.result
        this.storeList.forEach(store => {
          if (!this.db.objectStoreNames.contains(store.name)) {
            this.db.createObjectStore(store.name, {
              keyPath: store.key,
              autoIncrement: true
            })
          }
        })
      }
      request.onerror = (event) => {
        reject(event.currentTarget.error.message)
      }
    })
  }

  createStore(store) {
    return new Promise((resolve, reject) => {
      this.closeDb()
      this.dbVersion++
      localStorage.setItem(this.dbName + '-dbVersion', this.dbVersion)
      const request = localDatabase.open(this.dbName, this.dbVersion)
      request.onsuccess = () => {
        this.db = request.result
        console.log('open database success')
        resolve()
      }
      request.onupgradeneeded = () => {
        console.log('version change')
        this.db = request.result
        if (!this.db.objectStoreNames.contains(store.name)) {
          this.db.createObjectStore(store.name, {
            keyPath: store.key,
            autoIncrement: true
          })
        }
      }
      request.onerror = (event) => {
        new Error(event.currentTarget.error.message)
        reject()
      }
    })
  }

  clearStore(store) {
    return new Promise((resolve, reject) => {
      this.closeDb()
      this.dbVersion++
      localStorage.setItem(this.dbName + '-dbVersion', this.dbVersion)
      const request = localDatabase.open(this.dbName, this.dbVersion)
      request.onsuccess = () => {
        this.db = request.result
        console.log('open database success')
        resolve()
      }
      request.onupgradeneeded = () => {
        this.db = request.result
        if (this.db.objectStoreNames.contains(store)) {
          this.db.deleteObjectStore(store)
          console.log(`deleteObjectStore ${store} success`)
        }
      }
      request.onerror = (event) => {
        new Error(event.currentTarget.error.message)
        reject()
      }
    })
  }

  deleteDb() {
    localDatabase.deleteDatabase(this.dbName)
    console.log(this.dbName + 'database deleted')
  }

  closeDb() {
    if(this.db) {
      this.db.close()
      console.log('db closed')
    }
  }


  clearStoreData(storeName) {
    let store = this.db.transaction(storeName, 'readwrite').objectStore(storeName)
    store.clear()
  }

  addAllData(storeName, data) {
    let store = this.db.transaction(storeName, 'readwrite').objectStore(storeName)
    let storeRequest
    return new Promise((resolve, reject) => {
      data.forEach((it) => {
        storeRequest = store.add(it)
        storeRequest.onerror = () => {
          reject('add data error', it)
        }
        storeRequest.onsuccess = () => {
          resolve('add data success')
        }
      })
    })
  }

  putAllData(storeName, data) {
    let store = this.db.transaction(storeName, 'readwrite').objectStore(storeName)
    data.forEach((it) => {
      let storeRequest = store.put(it)
      storeRequest.onerror = () => {
        console.error('put add data error')
      }
      storeRequest.onsuccess = () => {
        console.log('put add data success')
      }
    })
  }

  put(storeName, newItem) {
    return new Promise((resolve) => {
      let store = this.db.transaction([storeName], 'readwrite').objectStore(storeName)
      let storeRequest = store.put(newItem)
      storeRequest.onsuccess = () => {
        resolve('put add data success')
      }
    })
  }

  showAllData(storeName) {
    let store = this.db.transaction(storeName).objectStore(storeName)
    let result = []
    return new Promise((resolve, reject) => {
      store.openCursor().onsuccess = (event) => {
        // current cursor
        let cursor = event.target.result
        if (cursor) {
          result.push(cursor.value)
          // next
          cursor.continue()
        } else {
          if (!result.length)
            reject('nothing')
        }
        resolve(result)
      }
    })
  }

  delById(storeName, id) {
    let store = this.db.transaction([storeName], 'readwrite').objectStore(storeName)
    let storeRequest = store.delete(id)
    return new Promise((resolve, reject) => {
      storeRequest.onsuccess = (e) => {
        resolve('delete success')
      }
    })
  }

  editById(storeName, item, id) {
    let store = this.db.transaction([storeName], 'readwrite').objectStore(storeName)
    let storeRequest = store.get(id)
    return new Promise((resolve, reject) => {
      storeRequest.onsuccess = () => {
        // current data
        var curRecord = storeRequest.result
        for (let key in item) {
          if (typeof curRecord[key] !== 'undefined') {
            curRecord[key] = item[key]
          }
        }
        store.put(curRecord)
      }
    })
  }

  getDataById(storename, id) {
    return new Promise((resolve) => {
      var store = this.db.transaction(storename).objectStore(storename)
      let storeRequest = store.get(id)
      storeRequest.onsuccess = (e) => {
        resolve(e.target.result)
      }
    })
  }
}