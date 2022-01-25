const express = require('express');
const sqlite3 = require('sqlite3');

const menuItemsRouter = express.Router({mergeParams: true});
const mIR = menuItemsRouter;

const db = new sqlite3.Database(process.env.TEST_DATABASE || ('./database.sqlite'));

mIR.param('menuItemId', (req, res, next, menuItemId)=> {
    db.get('SELECT * FROM MenuItem WHERE id = $menuItemId', {
        $menuItemId: menuItemId
    }, (error, menuitem) =>{
        if (error){
           next (error)
        } else if(menuitem){
            req.menuitem = menuitem;
            next();
        } else {
            res.sendStatus(404);
        }
    })
});

mIR.get('/', (req, res, next) => {
    db.all('SELECT * FROM MenuItem WHERE menu_id = $menuId', {
        $menuId: req.params.menuId
    },(error, menuitems)=> {
        if (error){
            next (error);
        } else {
            res.status(200).json({menuItems: menuitems});
        }
    })
});

mIR.post('/', (req, res, next)=> {
    const name= req.body.menuItem.name;
    const description = req.body.menuItem.description || null;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menu_id = req.params.menuId;

    if (!name || !inventory ||!price || !menu_id) {
        res.sendStatus(400);
    } else {
        db.run('INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menu_id)', {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menu_id: menu_id
        }, function (error) {
            if (error){
                next (error);
            } else {
                db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (error, menuItem)=> {
                    if (error){
                        next (error);
                    } else {
                        res.status(201).json({menuItem: menuItem});
                    }
                })
            }
        })
    }
})



mIR.put('/:menuItemId', (req, res, next)=> {
    const name= req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuItemId = req.params.menuItemId;

const sql = `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price  WHERE id = $id`;
const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $id: menuItemId
};

    if (!name || !inventory ||!price || !menuItemId) {
        res.sendStatus(400);
} else {
    db.run(sql, values, function (error){
      if (error){
          next(error);
      }  else {
          db.get(`SELECT * FROM MenuItem WHERE id = $id`, {
              $id: menuItemId
          }, (error, menuitem)=> {
              if (error){
                  next (error);
              } else {
                  res.status(200).json({menuItem: menuitem});
              }
          })
      }
    })
}
});

mIR.delete('/:menuItemId', (req,res,next)=> {
    db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`, (error) =>{
        if(error){
            next (error);
        } else {
            res.sendStatus(204);
        }
    })
});
module.exports = menuItemsRouter;