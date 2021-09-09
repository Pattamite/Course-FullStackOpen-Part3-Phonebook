const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const randomIdRange = 1000000000;

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

morgan.token("jsonData", (request, response) => {
  const body = request.body;
  if (!body) {
    return "";
  }
  return JSON.stringify(body);
});

function morganFormat(tokens, req, res) {
  console.log(tokens.body);
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
    tokens.jsonData(req, res),
  ].join(" ");
}

const app = express();
app.use(morgan(morganFormat));
app.use(cors());
app.use(express.json());
app.use(express.static('build'));

app.get("/info", (request, response) => {
  const currentDate = new Date();
  response.send(`
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${currentDate}</p>
  `);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => {
    return person.id === id;
  });

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.put("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => {
    return person.id === id;
  });

  if (!person) {
    return response.status(400).json({
      error: `person id ${id} not found.`,
    });
  }

  const body = request.body;

  if (!body.number) {
    return response.status(400).json({
      error: "number is missing",
    });
  }

  const newPerson = {
    ...person,
    number: body.number
  }
  
  persons = persons.map((person) => {
    return person.id === id
      ? newPerson
      : person;
  });

  response.json(newPerson);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => {
    return person.id !== id;
  });

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (
    !body.name ||
    persons.find((person) => {
      return person.name === body.name;
    })
  ) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: "number is missing",
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };
  persons = persons.concat(person);
  response.json(person);
});

function generateId() {
  return Math.floor(Math.random() * randomIdRange);
}

function unknownEndpoint(request, response) {
  response.status(404).send({ error: "unknown endpoint" });
}

app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
