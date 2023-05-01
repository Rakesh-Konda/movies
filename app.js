const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const dbpath = path.join(__dirname, "moviesData.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;

const hlo = async () => {
  try {
    db = await open({ filename: dbpath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`error:${e}`);
    process.exit(1);
  }
};
hlo();

const convert = (msg) => {
  return {
    movieId: msg.movie_id,
    directorId: msg.director_id,
    movieName: msg.movie_name,
    leadActor: msg.lead_actor,
  };
};

const convertdirector = (msg) => {
  return {
    directorId: msg.director_id,
    directorName: msg.director_name,
  };
};

//get
app.get("/movies/", async (request, response) => {
  const query = `SELECT movie_name  as movieName FROM movie;`;
  const arraylist = await db.all(query);
  response.send(arraylist);
});

//post
app.post("/movies/", async (request, response) => {
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  const query = `INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES (${directorId},"${movieName}","${leadActor}");`;
  await db.run(query);
  response.send("Movie Successfully Added");
});

//get based n ID
app.get(`/movies/:movieId/`, async (request, response) => {
  const { movieId } = request.params;
  const query = `SELECT * FROM movie
    WHERE movie_id=${movieId};`;
  const res = await db.get(query);
  response.send(convert(res));
});

//put
app.put(`/movies/:movieId/`, async (request, response) => {
  const { movieId } = request.params;
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  const query = `UPDATE movie SET
    director_id=${directorId}, movie_name="${movieName}",
    lead_actor="${leadActor}" WHERE movie_id=${movieId};`;
  await db.run(query);
  response.send("Movie Details Updated");
});

//DElete
app.delete(`/movies/:movieId/`, async (request, response) => {
  const { movieId } = request.params;
  const query = `DELETE FROM movie
    WHERE movie_id=${movieId}; `;
  await db.run(query);
  response.send("Movie Removed");
});

//get director
app.get(`/directors/`, async (request, response) => {
  const query = `select * from director;`;
  const res = await db.all(query);
  response.send(res.map(convertdirector));
});

//get specific director
app.get(`/directors/:directorId/movies/`, async (request, response) => {
  const { directorId } = request.params;
  const query = `SELECT movie_name as movieName FROM
    movie WHERE director_id=${directorId};`;
  const res = await db.all(query);
  response.send(res);
});
module.exports = app;
