const express = require('express');
const sqlite3 = require('sqlite3');
const timesheetsRouter = require('./timesheets');

const employeesRouter = express.Router();
const eR = employeesRouter;

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

eR.use('/:employeeId/timesheets', timesheetsRouter);

eR.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (error, employees) => {
        if (error) {
            next (error);
        } else {
            res.status(200).json({employees: employees});
            }
        
    })
})

eR.post('/', (req, res, next)=> {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    
    
console.log(name, position, wage);
    if (!name || !position || !wage) {
        res.sendStatus(400);
    } else {

    db.run('INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage)', {
        $name: name,
        $position: position,
        $wage: wage,     
    }, function (error) {
        if (error) {
            next (error);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, 
                (error, employee) => {
                    
                        res.status(201).json({employee: employee});
                    
                
            })
        }
    }
);
}
});

eR.param('employeeId', (req, res, next, employeeId) => {
    db.get('SELECT * FROM Employee WHERE id = $employee',{
        $employee: employeeId
    }, (error, employee)=> {
        if (error){
            next(error);
        } else if(employee) {
            req.employee = employee;
            next();
        } else {
            res.sendStatus(404);
        }
    })
})

eR.get('/:employeeId', (req, res, next)=> {
    res.status(200).json({employee: req.employee});
})

eR.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const employeeId = req.params.employeeId;

    if (!name || !position || !wage){
        res.sendStatus(400);
    } else {
        const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE id = $employeeId';
        const values = {
            $name: name,
            $position: position,
            $wage: wage,
            $employeeId: employeeId
        };
        db.run(sql, values, (error)=>{
            if (error){
                next (error)
            } else {
                db.get(`SELECT * FROM Employee WHERE id = ${employeeId}`, (error, employee)=>{
                    if(error) {
                        next(error);
                    } else {
                        res.status(200).json({employee: employee});
                    }
                })
            }
        })
    
    }


})

eR.delete('/:employeeId', (req, res, next)=> {
    const sql= `UPDATE Employee SET is_current_employee = 0 WHERE id = ${req.params.employeeId}`
    db.run(sql, (error)=>{
        if (error) {
            next (error)
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (error, employee) => {
                if (error){
                    next(error)
                } else {
                    res.status(200).json({employee: employee});
                }
            })
        }
    })
})

module.exports = employeesRouter;