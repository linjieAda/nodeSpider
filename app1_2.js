var express = require('express')
var superagent = require('superagent')  //专注于处理服务端/客户端的http请求
var cheerio = require('cheerio')    //向jq一样操纵数据
var eventproxy = require('eventproxy')
var fs = require('fs')

var app = express(),
    ep = new eventproxy(),
    imgUrlsArray = [],  //存放网页中的图片链接
    pageUrls = [],      //存放需要爬取图片的网页
    pageNum = 2,        // 要取几页
    randomPre = 'dl' + parseInt(Math.random()*100000) + '-', //起名字用的
    counter = 1;        // 起名字的计数器
    dir = './images'    // 放图片的目录


// var pageStart = 1914
// pageUrls.push('http://jandan.net/pic/page-'+ curPage +'#comments')
//
var pageStart = 1
for (var i = pageStart ; i <= pageNum ; i++) {
  var curPage = i
  pageUrls.push('http://dnf.17173.com/2014pic/214zxtp_'+ curPage +'.shtml')
}

// console.log(pageUrls)
console.log('start--------')

app.get('/', function(req, res, next) {
  pageUrls.forEach( function(pageUrls){
    superagent.get(pageUrls)
      .end(function(err, sres) {
        if(err) {
          return next(err)
        }

        var $ = cheerio.load(sres.text)
        var curImgUrls = $('.comm-pn-bd img')

        for(var i = 0 ; i < curImgUrls.length ; i++){
          var curImgUrl = curImgUrls.eq(i).attr('src')
          imgUrlsArray.push(curImgUrl)
          // download(curImgUrl, dir ,randomPre + counter + curImgUrl.substr(-4, 4))
          // counter++;
          ep.emit('imgUrlGet', curImgUrl)
        }
      })
  })

  // 这里curImgUrls是 cureImgUrl数组, 这里控制了并发
  ep.after('imgUrlGet', imgUrlsArray.length, function(curImgUrls) {
    console.log('curImgUrls:', curImgUrls)

    curImgUrls.map(function(curImgUrl) {
      if(curImgUrl.length !== 0) {
        download(curImgUrl, dir ,randomPre + counter + curImgUrl.substr(-4, 4))
      }
      counter++;
    })
  })

})

function download(url, dir, filename) {
  superagent.head(url, function(err, res, body) {
    if(err) {
      console.log('err: ', err)
      return;
    }
    superagent(url).pipe(fs.createWriteStream(dir + "/" + filename)) //stream
  })
}


app.listen(3000, function(req, res) {
  console.log('app is running at port 3000')
})