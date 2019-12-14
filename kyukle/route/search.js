var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
var ejs = require('ejs');
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));

//인덱스
router.get(['/index', '/'], function (req, res) {
  var queryString = 'SELECT NOW() nowDate';

  getConnection().query(queryString, function (error2, data) {
    if (error2) {
        console.log(error2);
        return
    }
  });


  fs.readFile('./html/index.html', 'utf-8', function (error, data) {
      res.send(data);
  });
});

//검색 결과창
router.get('/result', function (req, res) {
  var searchTerms = nvl(req.query.q).toUpperCase();
  var searchTermsArray = searchTerms.split(' ')
  var searchTermsLength = searchTermsArray.length;
  var currentPage = Number(nvl(req.query.p, 1));
  var pageSize = 10; //페이지당 게시물 수 : 한 페이지 당 10개 게시물
  var pageListSize = 10; //페이지의 갯수 : 1 ~ 10개 페이지
  var totalCount = 0; //전체 검색
  var totalPageCount = 0; //전체 페이지 수
  var startPage = 0;  //현재 세트내 출력될 시작 페이지
  var endPage = 0;  //현재 세트내 출력될 마지막 페이지
  var query = nvl(req.query.q, ''); //검색어

  console.log("-searchTerms-");
  console.log(searchTerms);
  console.log(searchTermsLength);

  var commonWhere = '';
  commonWhere +=  ' AND (';
  for(var i = 0; i < searchTermsLength; i++ ){
    commonWhere += "UPPER(TITLE) LIKE '%"+searchTermsArray[i]+"%' OR ";
    commonWhere += "UPPER(HEAD) LIKE '%"+searchTermsArray[i]+"%' OR ";
    commonWhere += "UPPER(BODY) LIKE '%"+searchTermsArray[i]+"%' ";
    if( i+1 != searchTermsLength ) commonWhere += 'OR ';
  }
  commonWhere += ' )';
  console.log("-commonWhere-");
  console.log(commonWhere);
  console.log("-searchTermsArray-");
  searchTermsArray = searchTermsArray.concat(searchTermsArray).concat(searchTermsArray);
  console.log(searchTermsArray);

  var queryString = '';
  queryString  = '  SELECT COUNT(*) AS totalCount';
  queryString += '  FROM TB_SEARCH_DATA ';
  queryString += '  WHERE 1 = 1 ';
  queryString += commonWhere;
  queryString += '  LIMIT 0, 10';

  console.log("-queryString-");
  console.log(queryString);

  var pagingResult;
  var listResult;

  //페이지 변수 세팅
  getConnection().query(queryString, function (error2, data) {
    var start = Date.now();

    if (error2) {
      console.log(error2);
      return
    }

    totalCount = Number(nvl(data[0].totalCount, 0));
    totalPageCount = Math.ceil(totalCount / 10);
    currentPage = currentPage <= 0 ? 1 : currentPage > totalPageCount ? totalPageCount : currentPage;
    startPage = ((Math.ceil(currentPage / 10) - 1) * 10) + 1
    endPage = (startPage + pageListSize) - 1;
    endPage = endPage > totalPageCount ? totalPageCount : endPage;
    //페이징 변수 생성
    pagingResult = {
      "totalCount": totalCount,
      "currentPage": currentPage,
      "totalPageCount": totalPageCount,
      "startPage": startPage,
      "endPage": endPage,
      "pageSize": pageSize,
      "pageListSize": pageListSize
    };
    console.log("- pagingResult -");
    console.log(pagingResult);
    //전체 리스트 구하기
    queryString  = '  SELECT';
    queryString += '    TITLE AS title';
    queryString += '    , SITE_URL AS siteUrl';
    queryString += '    , SUBSTR(UPPER(BODY), INSTR(UPPER(BODY), \''+searchTermsArray[0]+'\')-60, LENGTH(\''+searchTermsArray[0]+'\')+220) AS body';
    queryString += '  FROM (';
    queryString += '  	SELECT * ';
    queryString += '  	FROM TB_SEARCH_DATA ';
    queryString += '  WHERE 1 = 1 ';
    queryString += commonWhere;
    queryString += '  ORDER BY SCORE DESC '
    queryString += '  	LIMIT ' + (currentPage * pageSize) +',' + pageSize;
    queryString += '  ) T1';
    console.log("-queryString-");
    console.log(queryString);

    //검색 데이터 생성
    getConnection().query(queryString, function (error2, data) {
      if (error2) {
          console.log(error2);
          return
        }
        listResult = data;
        //뷰 생성
        fs.readFile('./html/result.html', 'utf-8', function (error, data) {
          var duration = (Date.now() - start) / 1000;
          console.log("Date.now()");
          console.log(Date.now());

          res.send(ejs.render(data, {
              query: query,
              duration: duration,
              pagingResult: pagingResult,
              listResult: listResult
          }));
        });
    });
  });





});

//mysql db 연결 함수
var pool = mysql.createPool({
  connectionLimit: 10,
  host: '210.0.47.232',
  port: '3306',
  user: 'root',
  database: 'se',
  password: '1234'
});

//디비 연결 함수
function getConnection() {
  return pool
}

//널처리 함수
function nvl(str, dstr) {
  if( str == null || str == undefined || str == '' ){
    if( dstr != null && dstr != undefined && dstr != '' ){
      str = dstr;
    }else{
      str = '';
    }
  }
  return str;
}

module.exports = router
