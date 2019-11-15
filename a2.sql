SET search_path TO A2;
-- Add below your SQL statements. 
-- For each of the queries below, your final statement should populate the respective answer table (queryX) with the correct tuples. It should look something like:
-- INSERT INTO queryX (SELECT … <complete your SQL query here> …)
-- where X is the correct index [1, …,10].
-- You can create intermediate views (as needed). Remember to drop these views after you have populated the result tables query1, query2, ...
-- You can use the "\i a2.sql" command in psql to execute the SQL commands in this file.
-- Good Luck!

--Query 1 statements
INSERT INTO query1( 
	Select pl.pname, c.cname, t.tname
	From player pl 
	INNER Join country c on pl.cid = c.cid 
	INNER Join champion ch on ch.pid = pl.pid 
	INNER Join tournament t on t.tid = ch.tid 
	where pl.cid = c.cid
	order by pname;
)

--Query 2 statements
INSERT INTO query2( 
	SELECT t.tname, max(c.totalCapacity)
	from tournament t 
	inner join court c on t.tid = c.tid
	order by tname;
)

--Query 3 statements
INSERT INTO query3( 
	Select ev.winid as p1id, pl.playername as p1name
		, ev.lossid as p2id, pl2.playername as p2name
	from event ev
	right join player pl on pl.pid = ev.pwinid
	right join player pl2 on pl2.pid = ev.p2id
	WHERE pl2.globalrank = (SELECT MAX(globalrank) FROM pl2)
	ORDER BY p1name;

)

--Query 4 statements
INSERT INTO query4( 
	SELECT c.pid, p.pname 
	FROM champion c 
	RIGHT JOIN player p on p.pid = c.pid
	RIGHT JOIN Tournament t on t.tid = c.tid
	WHERE c.tid IS NOT NULL
	order by pname;

)

--Query 5 statements
INSERT INTO query5( 
	SELECT p.pid , p.pname , AVG(r.wins) as avgwins
	FROM record r
	RIGHT JOIN player p on r.pid = p.pid 
	WHERE ( SELECT wins FROM record r 
			where r.year BETWEEN 2011 and 2014
			ORDER BY wins DESC LIMIT 10)
	GROUP BY pid 
	ORDER BY avgwins DESC;

)

--Query 6 statements
INSERT INTO query6( 
	SELECT p.pid as pid, p.pname as pname
	FROM player as p 
	RIGHT JOIN record as r 
	WHERE NOT EXISTS (SELECT r1.pid
						FROM record  r1, record r2
						where r1.pid = r2.pid and 
						r1.year < r2.year and
						r1.wins > r2.wins)
	ORDER BY pname; 
	
)

--Query 7 statements
INSERT INTO query7( 
	SELECT c.pname, c.year 
	FROM champion c, champion c2
	ON c.pid = c2.pid AND c.year = c2.year
	ORDER BY pname DESC, year DESC;

)

--Query 8 statements
INSERT INTO query8( 
	SELECT p1.pname as p1name, p2.pname as p2name, c.cname 
	FROM event e 
	RIGHT JOIN player p1 ON 
	RIGHT JOIN player p2 ON 
	RIGHT JOIN country c ON 

	ORDER BY p1name DESC, year DESC

)

--Query 9 statements
INSERT INTO query9( 
	SELECT c.cname, COUNT(c.cid) as champions
	FROM country c 
	RIGHT JOIN player p ON p.cid = c.cid 
	RIGHT JOIN champion ch ON ch.pid = p.pid 
	GROUP BY c.cid
	ORDER BY champions DESC
	LIMIT 1;

)

--Query 10 statements
INSERT INTO query10( 
	SELECT p.pname 
	FROM player p 
	RIGHT JOIN event e ON e.winid = p.pid 
	RIGHT JOIN event e2 on e2.lossid = p.pid 
	WHERE (count(e.winid) > count(e2.lossid) AND e.year = 2014 AND e2.year = 2014)
	GROUP BY p.pid
	having sum(duration) > 200
	ORDER BY pname DESC;
)

