//index.js
//获取应用实例
const app = getApp()
const mqtt = require('../../utils/mqtt.js')
const base64 = require('../../utils/base64.js');
const config = require('../../config')

Page({
  data: {
    test: 'helloworld',
    message: '',

    TopicList: ["test1", "test2", "test3", "test4"],
    list: [{
        id: 1,
        name: 'node1',
        temp: 18.8
      },
      {
        id: 2,
        name: 'node2',
        temp: 26.3
      },
      {
        id: 3,
        name: 'node3',
        temp: 26.3
      }, {
        id: 4,
        name: 'node4',
        temp: 26.3
      },
    ],
    messageList: []

  },
  onLoad: function () {
    this.initSocket();
  },
  isJSON: function (str) {
    if (typeof str == 'string') {
      try {
        var obj = JSON.parse(str);
        if (typeof obj == 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        // console.log('error：' + str + '!!!' + e);
        return false;
      }
    }
    return true
  },
  initSocket: function () {
    const that = this
    const client = mqtt.connect(config.url, {
      clientId: "clientUserId"
    });
    client.on('reconnect', (error) => {
      console.log('正在重连:', error)
    });
    client.on('error', (error) => {
      console.log('连接失败:', error);
    });
    client.on('connect', function () {
      console.log('连接成功');
      //订阅
      that.subscribeTopicList(client, that.data.TopicList)
    })

    client.on('message', function (topic, payload) {
      // console.log("订阅 Topic：", topic);
      // console.log("收到内容：", payload.toString());
      that.setData({
        message: payload.toString()
      }, () => {
        console.log(that.data.message)
        var jsonobj = that.data.message
        var messageList = that.data.messageList
        if (that.isJSON(jsonobj)) {
          // 处理数据
          var jsonobject = JSON.parse(jsonobj)
          var node = jsonobject.deviceName
          var data = base64.decode(jsonobject.data)
          var msg = {
            "node": node,
            "data": data,
          }
          var list =that.data.list
          var index = (list || []).findIndex((list1) => 
            list1.name == msg.node         
          )
          list[index].name=msg.node
          list[index].temp=msg.data
          // messageList.push(msg)
          // 上传数据库
          console.log(messageList)
          // console.log(JSON.parse(jsonobj))
          that.setData({
            messageList: messageList,
            list:list
            // "list[index].name":msg.node,
            // "list[index].temp":msg.data
          })
        }
      })
    })
  },

  changeMessageList: function (msg) {
    // var list = this.data.list
    // var index = (list || []).findIndex((list) => {
    //   list.node = msg.node
    // })
    // return index
    // list[index].name = msg.node
    // list[index].temp = msg.data
  },
  subscribeTopicList: function (client, TopicList) {
    for (let index = 0; index < TopicList.length; index++) {
      client.subscribe(TopicList[index])
      console.log("订阅成功", TopicList[index])
    }
  }
})