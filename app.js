const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const hasTodoProperty = (requestQuery) => {
  return requestQuery.todo !== undefined;
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasDueDateProperty = (requestQuery) => {
  return requestQuery.dueDate !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

//1.GET todos API
app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  const getTodosQuery = `SELECT * 
     FROM todo
     WHERE todo LIKE '%${search_q}%'
        AND priority LIKE '%${priority}%'
        AND status LIKE '%${status}%';`;
  const todosArray = await db.all(getTodosQuery);
  response.send(todosArray);
});

//2.GET todo API
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * 
     FROM todo 
     WHERE id = '${todoId}';`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

//4.Create todo in todo table API
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const createTodoQuery = `INSERT INTO todo(id,todo,priority,status)
                            VALUES 
                                (${id} , '${todo}' , '${priority}' , '${status}');`;
  const dbResponse = db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//5.Update todo based on todoId API
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateTodoQuery;
  let msg;
  switch (true) {
    case hasPriorityProperty(request.body):
      const { priority } = request.body;
      updateTodoQuery = `UPDATE todo 
             SET priority = '${priority}'
             WHERE id = ${todoId};`;
      msg = "Priority Updated";
      break;
    case hasStatusProperty(request.body):
      const { status } = request.body;
      updateTodoQuery = `UPDATE todo 
             SET status = '${status}'
             WHERE id = ${todoId};`;
      msg = "Status Updated";
      break;
    case hasTodoProperty(request.body):
      const { todo } = request.body;
      updateTodoQuery = `UPDATE todo 
             SET todo = '${todo}'
             WHERE id = ${todoId};`;
      msg = "Todo Updated";
      break;
    case hasCategoryProperty(request.body):
      const { category } = request.body;
      updateTodoQuery = `UPDATE todo 
             SET category = '${category}'
             WHERE id = ${todoId};`;
      msg = "Category Updated";
      break;
    case hasDueDateProperty(request.body):
      const { dueDate } = request.body;
      updateTodoQuery = `UPDATE todo 
             SET due_date = '${dueDate}'
             WHERE id = ${todoId};`;
      msg = "Due Date Updated";
      break;
  }
  await db.run(updateTodoQuery);
  response.send(msg);
});

//6.Delete todo API
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo 
     WHERE id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
