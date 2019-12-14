//모듈 임포트
var express = require('express');
var app = express();
var morgan = require('morgan') //로그 모듈 임포트
var mysql = require('mysql') //mysql 임포트
var bodyParser = require('body-parser');
//미들웨어 설정
app.use(morgan('short')) //로그 미들웨어
app.use(express.static('./static')) //정적 파일 경로
app.use(bodyParser.urlencoded({extended:false}));

//상품리스트 게시판~!
var searchRouter = require('./route/search.js');
console.log("searchRouter : "+searchRouter);

app.use(searchRouter);

//서버 가동
app.listen(80, function(){
  console.log("서버가동");
});
