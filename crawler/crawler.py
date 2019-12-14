from urllib.request import urlopen
from bs4 import BeautifulSoup
import pymysql
import uuid
import time

##사이트 검색##
def fc_searchUrl(s_siteUrl):
    print(s_siteUrl);

    try :
        html = urlopen(s_siteUrl)  

        bsObject = BeautifulSoup(html, "html.parser")


        [s.extract() for s in bsObject('script')]
        [s.extract() for s in bsObject('style')]
        [s.extract() for s in bsObject('iframe')]
        [s.extract() for s in bsObject('a')]
        [s.extract() for s in bsObject('li')]
        # [s.extract() for s in bsObject('header')]
        # [s.extract() for s in bsObject('footer')]

        #검색엔진 데이터 추출 및 삽입
        s_title =bsObject.find("title").get_text()
        s_head = bsObject.find("head").get_text()
        s_body = bsObject.find("body").get_text()

        sql = "INSERT INTO" \
            +" TB_SEARCH_DATA (ID, SITE_URL, TITLE, HEAD, BODY, REG_DT, UPDATE_DT)" \
            +" VALUES (%s, %s, %s, %s, %s, now(), now())" \
            +" ON DUPLICATE KEY" \
            +" UPDATE" \
            +" TITLE = %s," \
            +" HEAD = %s," \
            +" BODY = %s," \
            +" SCORE = SCORE + 1," \
            +" UPDATE_DT = now()"
        curs.execute(sql, (str(uuid.uuid4()), s_siteUrl, s_title, s_head, s_body, s_title, s_head, s_body))
        conn.commit()
    
        # 검색엔진 대기큐 삽입
        for link in bsObject.find_all("a"):
            linkUrl = link.get("href")
            if linkUrl is None:
                linkUrl = ""
            if linkUrl.startswith("http") or linkUrl.startswith("www"):
                sql = "INSERT INTO" \
                    +" TB_SEARCH_QUEUE (ID, SITE_URL, REG_DT)" \
                    +" VALUES (%s, %s, now())" \
                    +" ON DUPLICATE KEY" \
                    +" UPDATE" \
                    +" SITE_URL = %s"
                curs.execute(sql, (str(uuid.uuid4()), linkUrl, linkUrl))
    except:
        print(s_siteUrl+" 에러발생")
        
    conn.commit()
    


##검색 사이트 설정##
def fc_findUrl():
    sql = "SELECT ID, SITE_URL" \
        +" FROM TB_SEARCH_QUEUE" \
        +" ORDER BY REG_DT ASC" \
        +" LIMIT 0, 1"
        
    curs.execute(sql)
    rows = curs.fetchall()

    return rows[0]

## 큐에 등록된 사이트 삭제##
def fc_deleteUrl(s_id):
    sql = "DELETE FROM TB_SEARCH_QUEUE" \
        +" WHERE ID = %s"
    
    curs.execute(sql, s_id)
    conn.commit()


# MySQL Connection 연결
conn = pymysql.connect(host='210.0.47.232', user='root', password='1234',
                       db='se', charset='utf8')

curs = conn.cursor(pymysql.cursors.DictCursor)

while True:
    siteInfo = fc_findUrl()

    s_siteUrl = siteInfo.get("SITE_URL")
    s_id = siteInfo.get("ID")

    fc_searchUrl(s_siteUrl)
    fc_deleteUrl(s_id)

    time.sleep(1)
    
conn.close()
