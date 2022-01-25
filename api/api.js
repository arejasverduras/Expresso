const express = require('express');
const apiRouter = express.Router();


//require subRouters below
const employeesRouter = require('./employees');
const menusRouter = require('./menus');

//mount subRouters belos (app.use)
apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menus', menusRouter);

module.exports = apiRouter;