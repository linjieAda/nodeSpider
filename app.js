var express = require('express')
// var utility = require('utility')
var request = require('superagent')  //专注于处理服务端/客户端的http请求
var cheerio = require('cheerio')    //向jq一样操纵数据
var fs = require('fs')

var app = express()
var fetchUrl = 'http://jandan.net/ooxx/page-1319'
var dir = './images'
var counter = 1

app.get('/', function(req, res, next) {
  request.get(fetchUrl)
    .end(function(err, sres) {
      if(err) {
        return next(err)
      }

      var $ = cheerio.load(sres.text)
      var items = []
      $('body img').each(function(idx, element){
        var $element = $(element)
        const imgUrl = $element.attr('src')
        items.push(imgUrl)
        download(imgUrl, dir, counter + imgUrl.substr(-4, 4))
        counter++
      })

      console.log('imgUrls: ',items)

      // //将获得的imgurl放入到文件中
      // items.map(function(imgUrl) {
      //   imgUrl += '\n'
      //   fs.appendFile('./message.txt', imgUrl , (err) => {
      //     if (err) throw err;
      //     console.log('The ', imgUrl ,' was appended to file!');
      //   })
      // })
      //
    })
})

var download = function(url, dir, filename){
  request.head(url, function(err, res, body){
    if(err) {
      console.log('err: ', err)
      return;
    }
    request(url).pipe(fs.createWriteStream(dir + "/" + filename));
  });
};


app.listen(3000, function(req, res) {
  console.log('app is running at port 3000')
})