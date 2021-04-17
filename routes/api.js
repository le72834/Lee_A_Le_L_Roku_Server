const express = require('express');

//express router handles incoming requests and directs them 
const router = express.Router();

//import the sql connection
const connect = require("../config/sqlConfig");

router.get("/", (req,res) => {
    //res.json = echo json encode(...) in PHP
    res.json({message: "you hit the api route"});
});

router.get("/users", (req, res) => {
    //run a SQL query here
    //res.json(query result here)
    res.json({message: "all users route"});
})
router.get("/movies", (req, res) => {
    connect.getConnection(function (err, connection) {
        //if (err) throw err; // not connected!
       
        connection.query(

            'SELECT m.*,GROUP_CONCAT(g.genre_name) AS movie_genre '+
            'FROM tbl_movies m '+
            'LEFT JOIN tbl_mov_genre link ON link.movies_id = m.movies_id '+
            'LEFT JOIN tbl_genre g ON g.genre_id = link.genre_id '+
            'GROUP BY m.movies_id',

            function (error, results) {
            connection.release();
            if (error) throw error;

            for (let object in results){
                if (results[object].movie_genre){
                    results[object].movie_genre = results[object].movie_genre.split(",");
                }
            }

            res.json(results);
        });
      });
    
});
router.get('/movies/filter/:genre', (req, res) => {
    connect.getConnection(function (err, connection) {

        connection.query(
            `SELECT m.*, GROUP_CONCAT(DISTINCT g.genre_name) AS genre_name `+
            `FROM tbl_movies m `+
            `LEFT JOIN tbl_mov_genre link ON link.movies_id = m.movies_id `+
            `LEFT JOIN tbl_genre g ON g.genre_id = link.genre_id `+
            `WHERE g.genre_name LIKE "%${req.params.genre}%" `+
            `GROUP BY m.movies_id`,

            function (error, results) {
            connection.release();
            if (error) throw error;

            for (let object in results){
                if (results[object].movie_genre){
                    results[object].movie_genre = results[object].movie_genre.split(",");
                }
            }

            res.json(results);
        });
    });

});
//dynamic route handler that can accept a parameter
//this is equidvalent to $_GET["id"] => (req.params.id)
//you're passing the id via the route: /api/movie/1, etc
router.get('/movies/:id', (req, res) => {

    connect.query(

        `SELECT m.*, `+
        `GROUP_CONCAT(DISTINCT g.genre_name) AS movies_genre, `+
        `GROUP_CONCAT(DISTINCT c.cast_name) AS movies_cast, `+
        `s.studio_name AS movies_studio, `+
        `d.director_name AS movies_director, `+
        

        `FROM tbl_movies m `+

        `LEFT JOIN tbl_mov_genre AS glink `+
        `ON glink.movies_id = m.movies_id `+
        `LEFT JOIN tbl_genre AS g `+
        `ON g.genre_id = glink.genre_id `+

        `LEFT JOIN tbl_mov_cast AS clink `+
        `ON clink.movies_id = m.movies_id `+
        `LEFT JOIN tbl_cast AS c `+
        `ON c.cast_id = clink.cast_id `+

        `LEFT JOIN tbl_mov_studio AS slink `+
        `ON slink.movies_id = m.movies_id `+
        `LEFT JOIN tbl_studio AS s `+
        `ON s.studio_id = slink.studio_id `+

        `LEFT JOIN tbl_mov_director AS dlink `+
        `ON dlink.movies_id = m.movies_id `+
        `LEFT JOIN tbl_director AS d `+
        `ON d.director_id = dlink.director_id `+

        

        `WHERE m.movies_id = ${req.params.id}`
        ,

        function (error, results) {
        if (error) throw error;

        for (let object in results){
            results[object].movies_genre = results[object].movies_genre.split(",");
            results[object].movies_cast = results[object].movies_cast.split(",");
        }

        res.json(results[0]);

    });
});
module.exports = router;