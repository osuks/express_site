// app.js
let PORT = 9214;
const { engine } = require('express-handlebars');
let express = require('express');
let db = require('./database/db-connector');
let exphbs = require('express-handlebars'); // Import express-handlebars
let app = express();
app.use(express.static(__dirname + '/views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const hbs = exphbs.create({
    extname: '.hbs',
    helpers: {
        custom_update: function (index, data_obj, root) {
            let root_string_json = JSON.stringify(root);
            root_string_json.replace(/&quot;/g, '"');

            let data_string_json = JSON.stringify(data_obj);
            data_string_json.replace(/&quot;/g, '"');
            return 'popup(/test/, ' + data_string_json + ', ' + root_string_json + ')';

        },
        custom_update_2: function (data_obj) {
            let data_string_json = JSON.stringify(data_obj);
            data_string_json.replace(/&quot;/g, '"');
            return 'popup(/test/, ' + data_string_json + ')';

        }
    }
});
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Homepage, Error Page
app.get('/', function (req, res) {
    res.render('index');
});
app.get('/error_page', function (req, res) {
    res.render('error_page');
});

// =========================================================================================================
// Search
// =========================================================================================================
app.get('/search', function (req, res) {
    let search_query = '';
    if (Object.keys(req.query).length > 0) {
        cus_last_name = req.query['input_lastname'];
        cus_last_name = cus_last_name.toLowerCase();
        search_query = `SELECT rez.REZ_ID as 'Reservation ID', rez.REZ_DATETIME as
        'Reservation Date', cus.CUS_FNAME as 'Customer First Name',
        cus.CUS_LNAME as 'Customer Last Name', res.RES_NAME as 'Restaurant'
        FROM Reservations as rez
        inner join Customers as cus on cus.CUS_ID = rez.CUS_ID
        inner join Restaurants as res on res.RES_ID = rez.RES_ID
        WHERE lower(cus.CUS_LNAME) = `
        search_query = search_query + "'" + cus_last_name + "'" + ';';
    } else {
        search_query = '';
    }

    if (Object.keys(req.query).length > 0) {
        db.pool.query(search_query, function (err, rows, fields) {
            res.render('search', {data: rows});
        });
    } else {
        res.render('search');
    }
});
// =========================================================================================================
// Reservations
// =========================================================================================================
app.get('/reservations', function (req, res) {
    let reservations = `SELECT rez.REZ_ID as 'Reservation ID', rez.REZ_DATETIME as
    'Reservation Date', cus.CUS_FNAME as 'Customer First Name',
    cus.CUS_LNAME as 'Customer Last Name', res.RES_NAME as 'Restaurant'
    FROM Reservations as rez
    inner join Customers as cus on cus.CUS_ID = rez.CUS_ID
    inner join Restaurants as res on res.RES_ID = rez.RES_ID;
    SELECT CUS_ID as id, concat(CUS_FNAME, ' ', CUS_LNAME) as fullname from Customers;
    SELECT RES_ID as id, RES_NAME as res_name from Restaurants;`
    db.pool.query(reservations, function (err, rows, fields) {
        res.render('reservations', {data: rows});
    });
});

app.get('/update_rez', function (req, res) {
    let rez_id = req.query.rez_id;
    let rez_update = `SELECT CUS_ID as id, concat(CUS_FNAME, ' ', CUS_LNAME) as fullname from Customers;
    SELECT RES_ID as id, RES_NAME as res_name from Restaurants;
    SELECT rez.REZ_ID, rez.REZ_DATETIME, cus.CUS_FNAME,
    cus.CUS_LNAME, cus.CUS_ID, res.RES_ID, res.RES_NAME
    FROM Reservations as rez
    inner join Customers as cus on cus.CUS_ID = rez.CUS_ID
    inner join Restaurants as res on res.RES_ID = rez.RES_ID
    WHERE rez.REZ_ID = `
    rez_update = rez_update + rez_id + ';';
    db.pool.query(rez_update, function (err, rows, fields) {
        res.render('update_rez', {data: rows});
    });

});

app.post('/update_reservation', function (req, res) {
    let data = req.body;
    let rez_date = data['cus_date']
    let rez_time = parseInt(data['option_time']) + 12;
    let rez_datetime = rez_date + ' ' + rez_time.toString() + ':00:00';
    let res_id = parseInt(data['option_res']);
    let cus_id = parseInt(data['option_customer']);
    let rez_id = parseInt(data['rez_id']);

    if (data['cus_date'] != '' && data['option_time'] && data['option_res'] &&
        data['option_customer'] && data['rez_id'] != '') {
        let rez_query = `UPDATE Reservations SET REZ_DATETIME = '${rez_datetime}',
         CUS_ID = ${cus_id}, RES_ID = ${res_id}
         WHERE REZ_ID = ${rez_id}`;
        db.pool.query(rez_query, function (error, rows, fields) {
            if (error) {
                res.render('error_page', {
                    msg: `Reservation could not be updated. Please try again.`,
                    backto: 'reservations',
                });
            } else {
                res.redirect('/reservations');
            }
        });
    } else {
        console.log('Invalid');
    }
});

app.post('/add_reservation', function (req, res) {
    let data = req.body;
    let rez_date = data['cus_date']
    let rez_time = parseInt(data['option_time']) + 12;
    let rez_datetime = rez_date + ' ' + rez_time.toString() + ':00:00';
    let res_id = parseInt(data['option_res']);
    let cus_id = parseInt(data['option_customer']);

    if (data['cus_date'] && data['option_time'] && data['option_res'] &&
        data['option_customer']) {
        let rez_query = `INSERT INTO Reservations (REZ_DATETIME, CUS_ID, RES_ID)
        VALUES ('${rez_datetime}', ${cus_id}, ${res_id})`;
        db.pool.query(rez_query, function (error, rows, fields) {
            if (error) {
                res.render('error_page', {
                    msg: `Reservation could not be made. Please try again.`,
                    backto: 'reservations',
                });
            } else {
                res.redirect('/reservations');
            }
        });
    } else {
        console.log('Invalid');
    }
});

app.post('/update_delete_rez', function (req, res) {
    let data = req.body;
    let action = data['action'];
    if (action == 'Update') {
        let cus_fname = data['input_cus_first_name'];
        let cus_lname = data['input_cus_last_name'];
        let cus_addr = data['input_cus_addr'];
        let cus_id = parseInt(data['cus_id']);
        let city_id = parseInt(data['option_city']);
        let st_id = parseInt(data['option_st']);
        let ctr_id = parseInt(data['option_ctr']);
        let zip_id = parseInt(data['option_zip']);
        let update_query = `UPDATE Customers
                                SET CUS_FNAME = '${cus_fname}',
                                CUS_LNAME = '${cus_lname}',
                                CUS_ADDRESS = '${cus_addr}',
                                CITY_ID = ${city_id},
                                ST_ID = ${st_id},
                                CTR_ID = ${ctr_id},
                                ZIP_ID = ${zip_id}
                                WHERE CUS_ID = ${cus_id};`;
        db.pool.query(update_query, function (error, rows, fields) {
            if (error) {
                res.sendStatus(400);
            } else {
                res.render('cus_update_success', {
                    msg: `'${cus_fname}' '${cus_lname}' successfully updated
                    'please close this window by clicking the close button!`
                });
            }
        });
    } else if (action == 'Delete') {
        let rez_id = parseInt(data['rez_id']);
        let delete_query = `DELETE FROM Reservations WHERE REZ_ID = ${rez_id};`;
        db.pool.query(delete_query, function (error, rows, fields) {
            if (error) {
                res.render('error_page', {
                    msg: `This reservation couldn't be deleted.`,
                    backto: 'reservations',
                });
            } else {
                res.redirect('/reservations');
            }
        });
    } else {
        console.log('Invalid');
    }
});
// =========================================================================================================
// Customers
// =========================================================================================================
app.get('/customers', function (req, res) {
    let customers = `SELECT cus.CUS_ID as No, cus.CUS_FNAME as 'First Name',
            cus.CUS_LNAME as 'Last Name', cus.CUS_ADDRESS as 'Address',
            city.CITY_NAME as City, st.ST_NAME as State, ctr.CTR_NAME
            as Country, zip.ZIP_CODE as 'Zip Code'
            FROM Customers as cus
            inner join Cities as city on city.CITY_ID = cus.CITY_ID
            inner join States as st on st.ST_ID = cus.ST_ID
            inner join Countries as ctr on ctr.CTR_ID = cus.CTR_ID
            inner join ZipCodes as zip on zip.ZIP_ID = cus.ZIP_ID;
            SELECT CITY_ID as id, CITY_NAME as city_name from Cities;
            SELECT ST_ID as id, ST_NAME as state_name from States;
            SELECT CTR_ID as id, CTR_NAME as country_name from Countries;
            SELECT ZIP_ID as id, ZIP_CODE as zipcode from ZipCodes`;
    db.pool.query(customers, function (err, rows, fields) {
        res.render('customers', { data: rows });
    });
});

app.post('/add_customer', function (req, res) {
    let data = req.body;
    let customer_fname = data['input_cus_first_name'];
    let customer_lname = data['input_cus_last_name'];
    let customer_addr = data['input_cus_addr'];
    let city_id = parseInt(data['option_city']);
    let st_id = parseInt(data['option_st']);
    let ctr_id = parseInt(data['option_ctr']);
    let zip_id = parseInt(data['option_zip']);
    if (customer_fname == '') {
        customer_fname = 'NULL';
    }
    if (customer_fname != 'NULL' && customer_lname != 'NULL' &&
        customer_addr != 'NULL' && city_id != 'NULL' &&
        st_id != 'NULL' && ctr_id != 'NULL' && zip_id != 'NULL') {
        let new_cus = `INSERT INTO Customers (CUS_FNAME, CUS_LNAME,
            CUS_ADDRESS, CITY_ID, ST_ID, CTR_ID, ZIP_ID)
            VALUES ('${customer_fname}', '${customer_lname}',
                '${customer_addr}', ${city_id}, ${st_id},
                ${ctr_id}, ${zip_id})`;
        db.pool.query(new_cus, function (error, rows, fields) {
            if (error) {
                res.sendStatus(400);
            } else {
                res.redirect('/customers');
            }
        });
    } else {
        console.log('customer name cannot be null');
    }
});

app.post('/update_delete_customer', function (req, res) {
    let data = req.body;
    let action = data['action'];
    if (action == 'Update' && data['input_cus_first_name'] &&
        data['input_cus_last_name'] && data['input_cus_addr'] &&
        data['cus_id'] && data['option_city'] && data['option_st'] &&
    data['option_ctr'] && data['option_ctr'] && data['option_zip']) {
        let cus_fname = data['input_cus_first_name'];
        let cus_lname = data['input_cus_last_name'];
        let cus_addr = data['input_cus_addr'];
        let cus_id = parseInt(data['cus_id']);
        let city_id = parseInt(data['option_city']);
        let st_id = parseInt(data['option_st']);
        let ctr_id = parseInt(data['option_ctr']);
        let zip_id = parseInt(data['option_zip']);
        console.log(data['option_st']);
        let update_query = `UPDATE Customers
                                SET CUS_FNAME = '${cus_fname}',
                                CUS_LNAME = '${cus_lname}',
                                CUS_ADDRESS = '${cus_addr}',
                                CITY_ID = ${city_id},
                                ST_ID = ${st_id},
                                CTR_ID = ${ctr_id},
                                ZIP_ID = ${zip_id}
                                WHERE CUS_ID = ${cus_id};`;
        db.pool.query(update_query, function (error, rows, fields) {
            if (error) {
                res.sendStatus(400);
            } else {
                res.render('cus_update_success', {
                    msg: `'${cus_fname}' '${cus_lname}' successfully updated
                    'please close this window by clicking the close button!`
                });
            }
        });
    } else if (action == 'Delete') {
        let cus_id = parseInt(data['cus_id']);
        let delete_query = `DELETE FROM Customers WHERE CUS_ID = ${cus_id};`;
        db.pool.query(delete_query, function (error, rows, fields) {
            if (error) {
                res.render('error_page', {
                    msg: `This customer cannot be deleted because he/she
                    currently has active reservations.`,
                    backto: 'customers',
                });
            } else {
                res.redirect('/customers');
            }
        });
    } else {
        console.log('Invalid');
    }
});

// =========================================================================================================
// Cities
// =========================================================================================================
app.get('/cities', function (req, res) {
    query1_cities = 'SELECT * FROM Cities';
    db.pool.query(query1_cities, function (err, rows, fields) {
        res.render('cities', { data: rows, headers: ['Id', 'City Name']});
    });
});

app.post('/add-city-form', function (req, res) {
    let data = req.body;
    let city_name = data['input-cityname'];
    if (city_name == '') {
        city_name = 'NULL';
    }
    // Create the query and run it on the database
    if (city_name != 'NULL') {
        let query1 = `INSERT INTO Cities (CITY_NAME) VALUES ('${data['input-cityname']}')`;
        db.pool.query(query1, function (error, rows, fields) {
            if (error) {
                res.sendStatus(400);
            } else {
                res.redirect('/cities');
            }
        });
    } else {
        console.log('City name cannot be null');
    }
});

app.post('/update_delete_city', function (req, res) {
    let data = req.body;
    let action = data['action'];
    if (action == 'Update') {
        let update_query = `UPDATE Cities
                                SET CITY_NAME = '${data['city_name']}'
                                WHERE CITY_ID = '${data['city_id']}';`;
        db.pool.query(update_query, function (error, rows, fields) {
            if (error) {
                res.sendStatus(400);
            } else {
                res.redirect('/cities');
            }
        });
    } else if (action == 'Delete') {
        let delete_query = `DELETE FROM Cities WHERE CITY_ID = '${data['city_id']}';`;
        db.pool.query(delete_query, function (error, rows, fields) {
            if (error) {
                res.render('error_page', {
                    msg: `City: '${data['city_name']}' cannot be deleted because it is in use as a foreign key on another record.`,
                    backto: 'cities',
                });
            } else {
                res.redirect('/cities');
            }
        });
    } else {
        console.log('Invalid');
    }
});

// =========================================================================================================
// States
// =========================================================================================================
app.get('/states', function (req, res) {
    let query1_states = 'SELECT * FROM States';
    db.pool.query(query1_states, function (err, rows, fields) {
        res.render('states', { data: rows, headers: ['Id', 'State Name', 'State Code']});
    });
});

app.post('/add-state-form', function (req, res) {
    let data = req.body;
    let state_name = data['input-statename'];
    let state_code = data['input-statecode'];
    if (state_name == '') {
        state_name = 'NULL';
    }
    if (state_code == '') {
        state_code = 'NULL';
    }
    if ((state_name != 'NULL') & (state_code != 'NULL')) {
        let query1 = `INSERT INTO States (ST_NAME, ST_CODE) VALUES ('${data['input-statename']}', '${data['input-statecode']}')`;
        // Send query to DB
        db.pool.query(query1, function (error, rows, fields) {
            if (error) {
                res.sendStatus(400);
            }
            // Refresh
            else {
                res.redirect('/states');
            }
        });
    } else {
        console.log('state name cannot be null');
    }
});

app.post('/update_delete_state', function (req, res) {
    let data = req.body;
    let action = data['action'];
    if (action == 'Update') {
        let update_query = `UPDATE States
                                SET ST_NAME = '${data['state_name']}',
                                ST_CODE = '${data['state_code']}'
                                WHERE ST_ID = '${data['state_id']}';`;
        // Query
        db.pool.query(update_query, function (error, rows, fields) {
            if (error) {
                res.sendStatus(400);
            }
            // Refresh
            else {
                res.redirect('/states');
            }
        });
    } else if (action == 'Delete') {
        let delete_query = `DELETE FROM States WHERE ST_ID = '${data['state_id']}';`;
        // Query
        db.pool.query(delete_query, function (error, rows, fields) {
            if (error) {
                res.render('error_page', {
                    msg: `State: '${data['state_name']}' cannot be deleted because it is in use as a foreign key on another record.`,
                    backto: 'states',
                });
            }
            // Refresh
            else {
                res.redirect('/states');
            }
        });
    } else {
        console.log('Invalid');
    }
});

// =========================================================================================================
// Countries
// =========================================================================================================
app.get('/countries', function (req, res) {
    let query1_countries = 'SELECT * FROM Countries';
    db.pool.query(query1_countries, function (err, rows, fields) {
        res.render('countries', { data: rows, headers: ['Id', 'Country Name', 'Country Code']});
    });
});

app.post('/add-country-form', function (req, res) {
    let data = req.body;
    let country_name = data['input-countryname'];
    let country_code = data['input-countrycode'];
    if (country_name == '') {
        country_name = 'NULL';
    }
    if (country_code == '') {
        country_code = 'NULL';
    }
    if ((country_name != 'NULL') & (country_code != 'NULL')) {
        let query1 = `INSERT INTO Countries (CTR_NAME, CTR_CODE) VALUES ('${data['input-countryname']}', '${data['input-countrycode']}')`;
        // Send query to DB
        db.pool.query(query1, function (error, rows, fields) {
            if (error) {
                res.sendStatus(400);
            }
            // Refresh
            else {
                res.redirect('/countries');
            }
        });
    } else {
        console.log('country name cannot be null');
    }
});

app.post('/update_delete_country', function (req, res) {
    let data = req.body;
    let action = data['action'];
    if (action == 'Update') {
        let update_query = `UPDATE Countries
                                SET CTR_NAME = '${data['country_name']}',
                                CTR_CODE = '${data['country_code']}'
                                WHERE CTR_ID = '${data['country_id']}';`;
        // Query
        db.pool.query(update_query, function (error, rows, fields) {
            if (error) {
                res.sendStatus(400);
            }
            // Refresh
            else {
                res.redirect('/countries');
            }
        });
    } else if (action == 'Delete') {
        let delete_query = `DELETE FROM Countries WHERE CTR_ID = '${data['country_id']}';`;
        // Query
        db.pool.query(delete_query, function (error, rows, fields) {
            if (error) {
                res.render('error_page', {
                    msg: `Country: '${data['country_name']}' cannot be deleted because it is in use as a foreign key on another record.`,
                    backto: 'countries',
                });
            }
            // Refresh
            else {
                res.redirect('/countries');
            }
        });
    } else {
        console.log('Invalid');
    }
});

// =========================================================================================================
// ZipCodes
// =========================================================================================================
app.get('/zipcodes', function (req, res) {
    query1_zipcodes = 'SELECT * FROM ZipCodes';
    db.pool.query(query1_zipcodes, function (err, rows, fields) {
        res.render('zipcodes', { data: rows, headers: ['Id', 'Zip Code']});
    });
});

app.post('/add-zipcode-form', function (req, res) {
    let data = req.body;
    let zipcode = data['input-zipcode'];
    if (zipcode == '') {
        zipcode = 'NULL';
    }
    // Create the query and run it on the database
    if (zipcode != 'NULL') {
        let query1 = `INSERT INTO ZipCodes (ZIP_CODE) VALUES ('${data['input-zipcode']}')`;
        db.pool.query(query1, function (error, rows, fields) {
            if (error) {
                res.sendStatus(400);
            } else {
                res.redirect('/zipcodes');
            }
        });
    } else {
        console.log('ZipCode name cannot be null');
    }
});

app.post('/update_delete_zipcode', function (req, res) {
    let data = req.body;
    let action = data['action'];
    if (action == 'Update') {
        let update_query = `UPDATE ZipCodes
                                SET ZIP_CODE = '${data['zipcode']}'
                                WHERE ZIP_ID = '${data['zipcode_id']}';`;
        db.pool.query(update_query, function (error, rows, fields) {
            if (error) {
                res.sendStatus(400);
            } else {
                res.redirect('/zipcodes');
            }
        });
    } else if (action == 'Delete') {
        let delete_query = `DELETE FROM ZipCodes WHERE ZIP_ID = '${data['zipcode_id']}';`;
        db.pool.query(delete_query, function (error, rows, fields) {
            if (error) {
                res.render('error_page', {
                    msg: `Zipcode '${data['zipcode']}' cannot be deleted because it is in use as a foreign key on another record.`,
                    backto: 'zipcodes',
                });
            } else {
                res.redirect('/zipcodes');
            }
        });
    } else {
        console.log('Invalid');
    }
});

// =========================================================================================================
// Restaurants
// =========================================================================================================

app.get('/restaurants', function (req, res) {
    let query1_restaurants = `
        SELECT R.RES_ID, R.RES_NAME, R.RES_ADDRESS, C.CITY_NAME, S.ST_NAME, C2.CTR_NAME, ZC.ZIP_CODE
        FROM Restaurants R
        INNER JOIN Cities C ON R.CITY_ID = C.CITY_ID
        INNER JOIN States S ON R.ST_ID = S.ST_ID
        INNER JOIN ZipCodes ZC ON R.ZIP_ID = ZC.ZIP_ID
        INNER JOIN Countries C2 ON R.CTR_ID = C2.CTR_ID
        ORDER BY RES_ID ASC;
    `;
    db.pool.query(query1_restaurants, function (err, rows, fields) {
        db.pool.query(`SELECT * FROM Cities`, function (err, cities_rows, fields) {
            db.pool.query(`SELECT * FROM States`, function (err, states_rows, fields) {
                db.pool.query(`SELECT * FROM ZipCodes`, function (err, zipcodes_rows, fields) {
                    db.pool.query(`SELECT * FROM Countries`, function (err, countries_rows, fields) {
                        global.cities_names = cities_rows.map((c) => c['CITY_NAME']);
                        global.states_names = states_rows.map((c) => c['ST_NAME']);
                        global.zipcodes_names = zipcodes_rows.map((c) => c['ZIP_CODE'].toString());
                        global.countries_names = countries_rows.map((c) => c['CTR_NAME']);
                        res.render('restaurants', {
                            data: rows,
                            cities: cities_rows,
                            states: states_rows,
                            zipcodes: zipcodes_rows,
                            countries: countries_rows,
                            headers: ['Id', 'Restaurant Name', 'Address', 'City', 'State', 'Country', 'Zip']
                        });
                    });
                });
            });
        });
    });
});

app.post('/add-restaurant-form', function (req, res) {
    let data = req.body;
    if (data['input-restaurantname'] == '') {
        restaurant_name = 'NULL';
    }
    if (data['input-restaurantname'] != 'NULL') {
        let query = `
        INSERT INTO Restaurants (RES_NAME, RES_ADDRESS, CITY_ID, ST_ID, CTR_ID, ZIP_ID)
        WITH cte1 AS (
                SELECT 1 AS IDX, CITY_ID
                FROM Cities
                WHERE CITY_NAME = '${data['input-restaurant_cityname']}'
                ORDER BY CITY_ID ASC LIMIT 1),
            cte2 AS (
                SELECT 1 AS IDX, ST_ID
                FROM States
                WHERE ST_NAME = '${data['input-restaurant_statename']}'
                ORDER BY ST_ID ASC LIMIT 1
                ),
            cte3 AS (
                SELECT 1 AS IDX, CTR_ID
                FROM Countries
                WHERE CTR_NAME = '${data['input-restaurant_countryname']}'
                ORDER BY CTR_ID ASC LIMIT 1
                ),
            cte4 AS (
                SELECT 1 AS IDX, ZIP_ID
                FROM ZipCodes
                WHERE ZIP_CODE = '${data['input-restaurant_zipcode']}'
                ORDER BY ZIP_ID ASC LIMIT 1
                )
            SELECT '${data['input-restaurantname']}' AS RES_NAME,
                   '${data['input-restaurant_address']}' as RES_ADDRESS,
                   CITY_ID, ST_ID, CTR_ID, ZIP_ID
        FROM cte1
        INNER JOIN cte2 USING (IDX)
        INNER JOIN cte3 USING (IDX)
        INNER JOIN cte4 USING (IDX)
    `;

        if (!cities_names.includes(data['input-restaurant_cityname'])) {
            res.render('error_page', {
                msg: `'${data['input-restaurant_cityname']}' is not a valid city name. Please select from: ${cities_names}`,
                backto: 'restaurants',
            });
        } else {
            if (!states_names.includes(data['input-restaurant_statename'])) {
                res.render('error_page', {
                    msg: `'${data['input-restaurant_statename']}' is not a valid state name. Please select from: ${states_names}`,
                    backto: 'restaurants',
                });
            } else {
                if (!countries_names.includes(data['input-restaurant_countryname'])) {
                    res.render('error_page', {
                        msg: `'${data['input-restaurant_countryname']}' is not a valid country name. Please select from: ${countries_names}`,
                        backto: 'restaurants',
                    });
                } else {
                    if (!zipcodes_names.includes(data['input-restaurant_zipcode'])) {
                        res.render('error_page', {
                            msg: `'${data['input-restaurant_zipcode']}' is not a valid zip code. Please select from: ${zipcodes_names}`,
                            backto: 'restaurants',
                        });
                    } else {
                        // Sucessful inputs
                        db.pool.query(query, function (error, rows, fields) {
                            if (error) {
                                res.sendStatus(400);
                            }
                            // Refresh
                            else {
                                res.redirect('/restaurants');
                            }
                        });
                    }
                }
            }
        }
    }
});

app.post('/update_delete_restaurant', function (req, res) {
    let data = req.body;
    let action = data['action'];

    if (action == 'Update') {
        if (data['restaurant_name'] == '') {
            res.render('error_page', {
                msg: `Restaurant name cannot be null or empty string.`,
                backto: 'restaurants',
            });
        } else {
            if (data['restaurant_address'] == '') {
                res.render('error_page', {
                    msg: `Restaurant address cannot be null or empty string.`,
                    backto: 'restaurants',
                });
            } else {
                if (!cities_names.includes(data['restaurant_cityname'])) {
                    res.render('error_page', {
                        msg: `'${data['restaurant_cityname']}' is not a valid city name. Please select from: ${cities_names}`,
                        backto: 'restaurants',
                    });
                } else {
                    if (!states_names.includes(data['restaurant_statename'])) {
                        res.render('error_page', {
                            msg: `'${data['restaurant_statename']}' is not a valid state name. Please select from: ${states_names}`,
                            backto: 'restaurants',
                        });
                    } else {
                        if (!countries_names.includes(data['restaurant_countryname'])) {
                            res.render('error_page', {
                                msg: `'${data['restaurant_countryname']}' is not a valid country name. Please select from: ${countries_names}`,
                                backto: 'restaurants',
                            });
                        } else {
                            if (!zipcodes_names.includes(data['restaurant_zipcode'])) {
                                res.render('error_page', {
                                    msg: `'${data['restaurant_zipcode']}' is not a valid zip code. Please select from: ${zipcodes_names}`,
                                    backto: 'restaurants',
                                });
                            } else {
                                let update_query = `
                                    UPDATE Restaurants
                                    SET Restaurants.RES_NAME='${data['restaurant_name']}',
                                        Restaurants.RES_ADDRESS='${data['restaurant_address']}',
                                        Restaurants.CITY_ID=(SELECT CITY_ID FROM Cities WHERE CITY_NAME='${data['restaurant_cityname']}'),
                                        Restaurants.ST_ID=(SELECT ST_ID FROM States WHERE ST_NAME='${data['restaurant_statename']}'),
                                        Restaurants.CTR_ID=(SELECT CTR_ID FROM Countries WHERE CTR_NAME='${data['restaurant_countryname']}'),
                                        Restaurants.ZIP_ID=(SELECT ZIP_ID FROM ZipCodes WHERE ZIP_CODE=${data['restaurant_zipcode']})
                                    WHERE Restaurants.RES_ID=${data['restaurant_id']};
                               `;
                                // Query
                                db.pool.query(update_query, function (error, rows, fields) {
                                    if (error) {
                                        res.sendStatus(400);
                                    }
                                    // Refresh
                                    else {
                                        res.redirect('/restaurants');
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
    } else if (action == 'Delete') {
        let delete_query = `
            DELETE FROM Restaurants
            WHERE RES_ID = '${data['restaurant_id']}';`;
        // Query
        db.pool.query(delete_query, function (error, rows, fields) {
            if (error) {
                res.render('error_page', {
                    msg: `Restaurant '${data['restaurant_name']}' cannot be deleted because it is in use as a foreign key on another record (reservation).`,
                    backto: 'restaurants',
                });
            }
            // Refresh
            else {
                res.redirect('/restaurants');
            }
        });
    } else {
        console.log('Invalid');
    }
});

/*  LISTENER    */
app.listen(PORT, function () {
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.');
});

// =========================================================================================================
// CreditCards
// =========================================================================================================


app.get('/creditcards', function (req, res) {
    let query1_creditcards = `
        SELECT CC_ID, CC_PIN_HASH, CC_NUMBER_HASH, CAST(CC_DEFAULT_CARD AS INTEGER) AS CC_DEFAULT_CARD, C.CUS_ID AS CC_CUS_ID,    
               CONCAT(C.CUS_FNAME, ' ', C.CUS_LNAME) AS CC_CUS_NAME
        FROM CreditCards
        JOIN Customers C ON CreditCards.CUS_ID = C.CUS_ID
        ORDER BY CC_CUS_NAME, CC_ID
    `;


    db.pool.query(query1_creditcards, function (err, rows, fields) {
        db.pool.query(`SELECT DISTINCT CUS_ID, CONCAT(CUS_FNAME, ' ', CUS_LNAME) AS CUS_NAME FROM Customers`, function (err, c_rows, fields) {
            global.c_rows = c_rows.map((c) => c['CUS_ID']);
            global.customers = c_rows.map((c) => c['CUS_ID']);
            res.render('creditcards', { data: rows, customers: c_rows, headers:
                    ['Id', 'Credit Card Pin', 'Credit Card Number', 'Default Card?', 'Customer Name']});
        });
    });
});

app.post('/add-creditcard-form', function (req, res) {
    let data = req.body;
    let creditcard_pin_hash = data['input-creditcard_pin_hash'];
    let creditcard_num_hash = data['input-creditcard_num_hash'];
    if (creditcard_num_hash == '') {
        creditcard_num_hash = 'NULL';
    }
    if (creditcard_pin_hash == '') {
        creditcard_pin_hash = 'NULL';
    }

    if (data['input-creditcard_default_card'] === 'on') {
        var defaultcc = 1
    } else {
        var defaultcc = 0
    }

    if ((creditcard_num_hash != 'NULL') & (creditcard_pin_hash != 'NULL') & (data['input-creditcard_cusid'] != '')) {
        let query1 = `
        INSERT INTO CreditCards (CUS_ID, CC_PIN_HASH, CC_NUMBER_HASH, CC_DEFAULT_CARD)
        VALUES ('${data['input-creditcard_cusid']}', '${data['input-creditcard_pin_hash']}', '${data['input-creditcard_num_hash']}', ${defaultcc})
        `;
        // Send query to DB
        db.pool.query(query1, function (error, rows, fields) {
            if (error) {
                res.sendStatus(400);
                console.log(query1);
            }
            // Refresh
            else {
                res.redirect('/creditcards');
            }
        });
    } else {
        console.log('creditcard number, pin, customer id cannot be null');
    }
});

app.post('/update_delete_creditcard', function (req, res) {
    let data = req.body;
    let action = data['action'];
    if (data['creditcard_default_card'] === 'on') {
        var defaultcc = 1
    } else {
        var defaultcc = 0
    }
    if (action == 'Update') {
        let update_query = `UPDATE CreditCards
                                SET CC_PIN_HASH = '${data['creditcard_pin_hash']}',
                                CC_NUMBER_HASH = '${data['creditcard_num_hash']}',
                                CC_DEFAULT_CARD = ${defaultcc},
                                CUS_ID = ${data['creditcard_cusid']}
                                WHERE CC_ID = ${data['creditcard_id']};`;

        console.log(data)
        console.log(update_query)
        // Query
        db.pool.query(update_query, function (error, rows, fields) {
            if (error) {
                res.sendStatus(400);
            }
            // Refresh
            else {
                res.redirect('/creditcards');
            }
        });
    } else if (action == 'Delete') {
        let delete_query = `DELETE FROM CreditCards WHERE CC_ID = '${data['creditcard_id']}';`;
        // Query
        db.pool.query(delete_query, function (error, rows, fields) {
            if (error) {
                res.render('error_page', {
                    msg: `Credit Card: '${data['creditcard_name']}' cannot be deleted because it is in use as a foreign key on another record.`,
                    backto: 'creditcards',
                });
            }
            // Refresh
            else {
                res.redirect('/creditcards');
            }
        });
    } else {
        console.log('Invalid');
    }
});
