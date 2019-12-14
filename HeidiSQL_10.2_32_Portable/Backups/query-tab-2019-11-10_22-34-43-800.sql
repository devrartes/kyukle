
SELECT ID, SITE_URL
FROM TB_SEARCH_QUEUE
ORDER BY REG_DT ASC
LIMIT 0, 1;

SELECT SITE_URL, TITLE FROM tb_search_data WHERE BODY LIKE '%월드 클래스%'


SELECT SITE_URL, TITLE, score FROM tb_search_data WHERE score > 0

SELECT TITLE FROM tb_search_data WHERE Title <> 'NAVER'

SELECT * FROM tb_search_data WHERE SITE_URL = 'http://www.smartjobfair.co.kr/'


SELECT NOW()

SELECT NOW() NOW

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '1234'

ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '1234'


SELECT COUNT(*) FROM tb_search_data
SELECT COUNT(*) FROM TB_SEARCH_QUEUE

DELETE FROM tb_search_data