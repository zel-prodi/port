const AWS = require('aws-sdk');
const express = require('express');
const nodemailer = require('nodemailer');
const moment = require('moment');

const IS_OFFLINE = process.env.NODE_ENV !== 'production';
                                                                //offline        //online
const GCPORTAL_DOCUMENT_TABLE = IS_OFFLINE === true ? "gcportal_document_tbl" : process.env.GCPORTAL_DOCUMENT_TABLE;
const GCPORTAL_USERS_TABLE = IS_OFFLINE === true ? "gcportal_users_tbl" : process.env.GCPORTAL_USERS_TABLE;
const GCPORTAL_MASTER_TABLE = IS_OFFLINE === true ? "gcportal_master_tbl" : process.env.GCPORTAL_MASTER_TABLE;

const dynamoDb = IS_OFFLINE === true ?
    new AWS.DynamoDB.DocumentClient({
        region: 'eu-east-2',
        endpoint: 'http://localhost:8000',
    }) :
    new AWS.DynamoDB.DocumentClient();

const router = express.Router();

//================================== TEST =========================================//
router.get('/test', (req, res) => {
    res.send('hello zel - gcportal')
})

router.get('/testing', (req, res) => {
    const params = {
        TableName: GCPORTAL_DOCUMENT_TABLE
    };
    dynamoDb.scan(params, (error, result) => {
        if (error) {
            res.status(400).json({ error: 'No Records Found..' });
        }else{
        res.json(result.Items);

        }
    });
});

router.get('/testCategory', (req, res) => {
    const params = {
        TableName: GCPORTAL_MASTER_TABLE
    };
    dynamoDb.scan(params, (error, result) => {
        if (error) {
            res.status(400).json({ error: 'No Records Found..' });
        }else{
        res.json(result.Items);

        }
    });
});

//================================== USER =========================================//
//GET USER INFO
router.get('/getUserInfo/:username', (req, res) => {
    const params = {
        TableName: GCPORTAL_USERS_TABLE,
        Key: {
            username: req.params.username
        }
    }
    dynamoDb.get(params, (error, result) => {
        if (error) {
            res.send(error.messgae)
        }
        if (result) {
            res.send(result.Item)
        }
    })
})

//ADD NEW USER
router.post('/registerUser', (req, res) => {
    let toAdd = req.body
    let params = {
        TableName: GCPORTAL_USERS_TABLE,
        Item: toAdd
    }
    dynamoDb.put(params, (err) => {
        if (err) {
            console.log(err.message)
            res.send(err.message)
        } else {
            res.send('User Successfully Registered')
        }
    })
})

//LOAD USER ACCOUNTS
router.get('/getUsers', (req, res) => {
    const params = {
        TableName: GCPORTAL_USERS_TABLE
    }

    dynamoDb.scan(params, (error, result) => {
        if (result) {
            res.send(result.Items)
        } else {
            res.send(error.message)
        }
    })
})

//UPDATE USER INFO
router.put('/updateUserAccount', (req, res) => {
    const params = {
        TableName: GCPORTAL_USERS_TABLE,
        Item: req.body
    }

    dynamoDb.put(params, (error) => {
        if (error) {
            res.send(error.message)
        } else {
            res.send('Record Saved')
        }
    })
})

//HARD DELETE USER ACCOUNT
router.delete('/deleteUserAccount/:username', (req, res) => {
    const params = {
        TableName: GCPORTAL_USERS_TABLE,
        Key: {
            username: req.params.username
        }
    }
    dynamoDb.delete(params, (error) => {
        if (error) {
            res.send(error.message)
        } else {
            res.send('User Account Successfully Deleted')
        }
    })
})

//GET HRD USER EMAIL - company group = secondary index
router.get('/getAllUserByCompanyGroup/:company_group', (req, res) => {
    const params = {
        TableName: GCPORTAL_USERS_TABLE,
        IndexName: 'company_group-index',
        KeyConditionExpression: 'company_group = :hkey',
        ExpressionAttributeValues: {
            ':hkey': req.params.company_group
        }
    }
    dynamoDb.query(params, (error, result) => {
        if (error) {
            res.send(error.message)
        }
        if (result) {
            res.send(result.Items)
        }
    })
})

//GETTING COMMON ACCOUNT CREDENTIALS BY SUB-GROUP
// router.get('/getCommonAccountLoginCredentials/:subGroup', (req, res) => {
//     const params = {
//         TableName: GCPORTAL_USERS_TABLE,
//         IndexName: 'gc_subgroup-index',
//         KeyConditionExpression: 'gc_subgroup = :hkey',
//         ExpressionAttributeValues: {
//             ':hkey': req.params.subGroup
//         }
//     }
//     dynamoDb.query(params, (error, result) => {
//         if (error) {
//             res.send(error.message)
//         }
//         if (result) {
//             res.send(result.Items)
//         }
//     })
// })

//================================== EMAIL NOTIFICATION =========================================//
router.post('/sendNotif', (req, res) => {
    //use the nodemailer to call the createTransport function that 
    //will help you to tell node what sill be the email and service you are going to use by sending email
    var transporter = nodemailer.createTransport({
        // host: 'smtp.gmail.com',
        // port: 465,
        // secure: true,
        service: 'gmail',
        auth: {
            user: 'dummyemail82492@gmail.com',
            pass: 'bloodstorm'
        }
    });
    //define object that will be the content of email
    var mailOptions = {
        from: 'dummyemail82492@gmail.com',
        to: req.body.recipient, //on multiple recipient, just separated it by adding comma ,())
        subject: req.body.subject,
        //   text: req.body.body
        html: req.body.body
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
            res.send(error)
        } else {
            console.log('Message sent: ' + info.response);
            res.send('Message sent: ' + info.response)

        }
        res.send(mailOptions)
    });
})


//==================================GLOBAL FUNCTIONS FOR FILES=========================================//
//get data using secondary indexes - Query method()
router.get('/getAllRecords/:document_type', (req, res) => {
    const params = {
        TableName: GCPORTAL_DOCUMENT_TABLE,
        IndexName: 'document_type-index',
        KeyConditionExpression: 'document_type = :hkey',
        ExpressionAttributeValues: {
            ':hkey': req.params.document_type
        }
    }
    dynamoDb.query(params, (err, result) => {
        if (err) {
            console.log(err.message)
        } else {
            let toSend = result.Items
            res.send(toSend)
        }
    })
})

//insert New record
router.post('/addNewRecord', (req, res) => {
    const toSend = req.body
        // toSend.id = uuid.v4()
        console.log(req.body)
    const params = {
        TableName: GCPORTAL_DOCUMENT_TABLE,
        Item: toSend
    }
    dynamoDb.put(params, (err) => {
        if (err) {
            console.log(err.message)
            res.send(err.message)
        } else {
            res.send('Record Successfully Added')
        }
    })
})

//update data
router.put('/updateRecord', (req, res) => {
    console.log(req.body)
    const params = {
        TableName: GCPORTAL_DOCUMENT_TABLE,
        Item: req.body
    }
    dynamoDb.put(params, (err) => {
        if (err) {
            console.log(err.message)
            res.send(err.message)
        } else {
            res.send('Record Saved')
        }
    })
})

//==================================TSUUTATSU=========================================//
//GET TOTAL TSUUTATSU RECORD FOR DOCUMENT ID ONGOING
router.get('/getDocumentID/:docType', (req, res) => {
    const document_type = req.params.docType;
    const params = {
        TableName: GCPORTAL_DOCUMENT_TABLE,
        IndexName: 'document_type-index',
        KeyConditionExpression: 'document_type = :hkey',
        ExpressionAttributeValues: {
            ':hkey': document_type
        }
    }
    dynamoDb.query(params, (error, result) => {
        if (error) {
            console.log(error.message)
            res.send(err.message)
        }
        if (result) {
            // res.json(result.Items.length)
            let arrLength = result.Items.length
            if(result.Items.length === 0){
                arrLength+1
            }else{
                if(arrLength <= 9){
                    res.send(moment().format('YYYY') +'-00'+ arrLength)
                }else if(arrLength <= 99){
                    res.send(moment().format('YYYY')  +'-0'+ arrLength)
                }else{
                    res.send(moment().format('YYYY')  +'-'+ arrLength)
                }
            }
                
            // console.log(documentID)
        } else {
            res.status(404).json({ error: 'error!! not found' })
        }
    })
})

//===== TSUUTATSU CATEGORY =======//
//GET TSUUTATSU CATEGORY
router.get('/getTsuutatsuCategory', (req, res) => {
    const params = {
        TableName: GCPORTAL_MASTER_TABLE
    }
    dynamoDb.scan(params, (error, result) => {
        if (error) {
            res.send(error.message)
        }
        if (result) {
            res.send(result.Items)
        }
    })
})

//ADD NEW TSUUTATSU CATEGORY
router.post('/addNewTsuutatsuCategory', (req, res) => {
    // console.log(req.body)
    const params = {
        TableName: GCPORTAL_MASTER_TABLE,
        Item: req.body
    }
    dynamoDb.put(params, (error) => {
        if (error) {
            res.send(error.message)
        } else {
            res.send('Category Saved')
        }
    })
})

//UPDATE CATEGORY
router.post('/updateTsuutatsuCategory', (req, res) => {
    const toSend = req.body;
    const params = {
        TableName: GCPORTAL_MASTER_TABLE,
        Key: {
            "category_id": toSend.category_id
        },
        UpdateExpression: 'set category_name = :category_name',
        ExpressionAttributeValues: {
            ':category_name': toSend.category_name
        },
        ReturnValues: "UPDATED_NEW"
    }
    dynamoDb.update(params, (error) => {
        if (error) {
            console.log(error)
            res.send(error.message)
        } else {
            console.log("Is New Field Updated")
            res.send('Category Saved')
        }

    })
})

//DELETE TSUUTATSU CATEGORY
router.post('/deleteTsuutatsuCategory/:category_id', (req, res) => {
    const params = {
        TableName: GCPORTAL_MASTER_TABLE,
        Key: {
            "category_id": req.params.category_id
        }
    }
    dynamoDb.delete(params, (error) => {
        if (error) {
            res.send(error)
        } else {
            res.send('Category Deleted')
        }
    })
})


//======= TSUUTATSU CONFIRMATIONS =======//
//GET CONFIRMATIONS
// router.get('/getConfirmations/:docType', (req, res) => {
//     const document_type = req.params.docType;
//     const params = {
//         TableName: GCPORTAL_DOCUMENT_TABLE,
//         IndexName: 'document_type-index',
//         KeyConditionExpression: 'document_type = :hkey',
//         ExpressionAttributeValues: {
//             ':hkey': document_type
//         }
//     }
//     dynamoDb.query(params, (error, result) => {
//         if (error) {
//             console.log(error.message)
//             res.send(error.message)
//         }
//         if (result) {
//             res.json(result.Items)
//         } else {
//             res.status(404).json({ error: 'error!! not found' })
//         }
//     })
// })

//======= TSUUTATSU RESPONSE =======//

//HARD DELETE - File Record
// router.delete('/deleteFile/:hID/:rID', (req, res) => {
//     const hID = req.params.hID;
//     const rID = req.params.rID;
//     const params = {
//         TableName: GCPORTAL_DOCUMENT_TABLE,
//         Key: {
//             circular_number: hID,
//             document_type: rID
//         }
//     };
//     dynamoDb.delete(params, (error) => {
//         if (error) {
//             res.status(400).json({ error: 'Could not delete File' });
//         }
//         // res.json({ success: true });
//         res.send("Record Successfully Deleted");
//     });
// });


//================================== RINGI =========================================//
//UPDATE isNew STATUS
router.post('/updateIsNewStatus', (req, res) => {
    const toSend = req.body;
    const params = {
        TableName: GCPORTAL_DOCUMENT_TABLE,
        Key: {
            "circular_number": toSend.circular_number,
            "document_type": toSend.document_type
        },
        UpdateExpression: 'set is_new = :is_new',
        ExpressionAttributeValues: {
            ':is_new': toSend.is_new
        },
        ReturnValues: "UPDATED_NEW"
    }
    dynamoDb.update(params, (error) => {
        if (error) {
            console.log(error)
        } else {
            console.log("Is New Field Updated")
        }

    })
})

//GETTING RINGI RECORD ACCORDING TO USER
// router.get('/getMyRingiRecords/:document_type/:employee_code', (req, res) => {
//     const document_type = req.params.document_type;
//     const employee_code = req.params.employee_code;
//     const params = {
//         TableName: GCPORTAL_DOCUMENT_TABLE,
//         IndexName: 'document_type-index',
//         KeyConditionExpression: 'document_type = :hkey',
//         ExpressionAttributeValues: {
//             ':hkey': document_type
//         }
//     }
//     dynamoDb.query(params, (error, result) => {
//         if (error) {
//             console.log(error.message)
//             res.status(400).json({ error: 'Error retrieving Ringi Document' })
//         }
//         if (result) {
//             let toSend = result.Items.filter(rec => {
//                 return rec.created_by_employee_code === employee_code
//             })
//             res.send(toSend)
//         } else {
//             res.status(404).json({ error: 'error!! not found' })
//         }
//     })
// })

//======= RINGI GET REVISED RINGI =======//
// router.get('/getRevisedRingi/:document_type/:document_id', (req, res) => {
//     const docType = req.params.document_type;
//     const docID = req.params.document_id;

//     const params = {
//         TableName: GCPORTAL_DOCUMENT_TABLE,
//         Key: {
//             document_type: docType,
//             document_id: docID
//         }
//     }
//     dynamoDb.get(params, (err, result) => {
//         if(err){
//             res.send(err.message)
//         }else{
//             // res.send(result)
//             console.log(result)
//         }
//     })
// })


module.exports = router;