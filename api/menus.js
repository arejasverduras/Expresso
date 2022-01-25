const express = require('express');
const sqlite3 = require('sqlite3');
const menuItemsRouter = require('./menuItems');

const menusRouter = express.Router();
const mR = menusRouter;

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

mR.use('/:menuId/menu-items', menuItemsRouter);

mR.param('menuId', (req, res, next, menuId) => {
    db.get('SELECT * FROM Menu WHERE id = $menuId', {
        $menuId: menuId
    }, (error, menu)=>{
        if (error){
            next(error)
        } else if (menu) {
            req.menu = menu;
            next();
        } else {
            res.sendStatus(404);
        }
    })

});

mR.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu', (error, menus)=> {
        if (error){
            next(error);
        } else {
            res.status(200).json({menus: menus});
        }
    })
})

mR.post('/', (req, res, next) => {
    const title = req.body.menu.title;

    if (!title) {
        res.sendStatus(400);
    } else {
        db.run(`INSERT INTO Menu (title) VALUES ($title)`, {
            $title: title
        }, function (error) {
            if(error){
                next(error);
            } else {
                db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (error, menu)=> {
                    if (error){
                        next (error) 
                    } else { 
                        res.status(201).json({menu: menu});
                    }
                })
            }
        })
    }
});



mR.get('/:menuId', (req, res, next)=> {
    const menu = req.menu;
    res.status(200).json({menu:menu});
})

mR.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    const menuId = req.params.menuId;

    if (!title) {
        res.sendStatus(400);
    } else {
        db.run('UPDATE Menu SET title = $title WHERE Menu.id = $menuId', {
            $title: title,
            $menuId: menuId
        }, function (error) {
            if (error) {
                next (error);
            } else {
                db.get(`SELECT * FROM Menu WHERE Menu.id = ${menuId}`, (error, menu)=> {
                    if (error){
                        next(error);
                    } else {
                        res.status(200).json({menu: menu});
                    }
                })
            }
        } )
    }
});

mR.delete('/:menuId', (req, res,next)=> {
    db.get('SELECT * FROM MenuItem WHERE menu_id = $menuId', {
        $menuId: req.params.menuId
    }, (error, menuitem) =>{
        if(error){
            next (error);
        } else {
            if (menuitem) {
            res.sendStatus(400);
            
        } else {
            db.run('DELETE FROM Menu WHERE id = $menuId', {
                $menuId: req.params.menuId
            }, (error)=> {
                if (error){
                    next (error);
                } else {
                    res.sendStatus(204);
                }
            })
        }}
    })
})

module.exports = menusRouter;