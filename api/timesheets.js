const express = require ('express');
const sqlite3 = require('sqlite3')
const timesheetsRouter = express.Router({mergeParams: true});
const tR = timesheetsRouter;

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

tR.get('/', (req, res, next)=> {
    db.all('SELECT * FROM Timesheet WHERE employee_id = $employeeId', {
        $employeeId: req.params.employeeId
    }, (error, timesheets) => {
        if(error){
            next(error)
        } else {
            res.status(200).json({timesheets: timesheets})
        }
    })
})

tR.post('/', (req, res, next) =>{
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.params.employeeId;

    if (!hours || !rate ||!date ||!employeeId) {
        res.sendStatus(400);
    } else {
        db.run(`INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)`, {
            $hours: hours,
            $rate: rate,
            $date: date,
            $employeeId: employeeId
        }, function (error) {
            if (error){
                next (error)
            } else {
                db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (error, timesheet)=>{
                    if (error){
                        next (error)
                    } else {
                        res.status(201).json({timesheet: timesheet});
                    }
                });
            }
        })
    }

})

tR.param('timesheetId', (req, res, next, timesheetId) => {
    db.get('SELECT * FROM Timesheet WHERE id = $timesheetId',
    {$timesheetId: timesheetId}, 
        (error, timesheet)=> {
            if (error) {
                next (error)
            } else {
                if (timesheet) {
                    req.timesheet = timesheet;
                    next();
                } else {
                    res.sendStatus(404);
                }
            }
        
    })
})


tR.put('/:timesheetId', (req, res, next)=> {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.params.employeeId;
    const timesheetId = req.params.timesheetId;

    if (!hours || !rate || !date || !employeeId || !timesheetId) {
        res.sendStatus(400);
    } else {
        db.run('UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE id = $timesheetId', 
        {
            $hours : hours,
            $rate: rate,
            $date: date,
            $timesheetId: timesheetId
        },
        function (error) {
            if (error){
                next (error);
            } else {
                db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId}`, (error, timesheet)=> {
                    if (error){
                        next (error)
                    } else {
                        res.status(200).json({timesheet: timesheet});
                    }
                })

            }
        }
        )
    }

})

tR.delete('/:timesheetId', (req, res, next)=> {
    db.run(`DELETE FROM Timesheet WHERE id = ${req.params.timesheetId}`, (error) => {
        if(error){
            next (error);
        } else {
            res.sendStatus(204);
        }
    })
})
module.exports = timesheetsRouter;