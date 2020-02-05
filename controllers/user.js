'use strict'

var fs = require('fs');
var path = require('path');
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

function pruebas(req, res) {
    res.status(200).send({
        message: "probando una opcion del controlador"
    });
}
function saveUser(req, res) {
    var user = new User();

    var params = req.body;

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_USER'
    user.image = 'null'

    if (params.password) {
        bcrypt.hash(params.password, null, null, (err, hash) => {
            user.password = hash
            if (user.name != null && user.surname != null && user.email != null) {
                user.save((err, userStored) => {
                    if (!err) {
                        if(!userStored) res.status(404).send({message: "user not saved"});
                        res.status(200).send({user: userStored});
                    } else {
                        res.status(500).send({message: "Error saving user"});
                    }
                })
            } else {
                res.status(200).send({message: "fill all fields"});
            }
        });
    } else {
        res.status(200).send({message: "enter password"});
    }
}
function loginUser (req, res){
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({email: email.toLowerCase()}, (err, user) => {
        if (err) {
            res.status(500).send({message: 'error en la peticion'});
        } else {
            if (!user){
                res.status(404).send({message: 'user not found'});
            } else {
                bcrypt.compare(password, user.password, (err, check) => {
                    if (check) {
                        if (params.getHash) {
                            res.status(200).send({token: jwt.createToken(user)});
                        } else {
                            res.status(200).send({user});
                        }
                    } else {
                        res.status(404).send({message: 'user could not login'});
                    }
                });
            }
        }
    });
}

function updateUser (req, res) {
    var userId = req.params.id;
    var update = req.body;

    if (userId != req.user.sub){
        return res.status(500).send({message: 'no authorization for this action'})
    }

    User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
        if (err) {
            res.status(500).send({message: 'error updating user'})
        } else {
            if (!userUpdated){
                res.status(404).send({message: 'user not found'})
            } else {
                res.status(200).send({user: userUpdated})
            }
        }
    });
}

function uploadImage (req, res) {
    var userId = req.params.id;
    var file_name = 'not uploaded';

    if (req.files) {

        //path should be req.files.image.path
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2]

        var extSplit = fileName.split('\.');
        var fileExt = extSplit[1]; 

        if (fileExt === 'png' || fileExt === 'jpg' || fileExt === 'gif') {
            User.findByIdAndUpdate(userId, {image: fileName}, (err, userUpdated) =>{
                if (err) {
                    res.status(500).send({message: 'error updating user image'});
                } else {
                    if (!userUpdated){
                        res.status(404).send({message: 'user not found'});
                    } else {
                        res.status(200).send({image: fileName, user: userUpdated});
                    }
                }
            });
        } else {
            res.status(200).send({message: 'invalid image format'});
        }
        
    } else {
        res.status(200).send({message: 'image not uploaded'})
    }
}

function getImageFile (req, res) {
    var imageFile = req.params.imageFile;
    var pathFile = './uploads/users/' + imageFile
    fs.exists(pathFile, (exists)=>{
        if (exists){
            res.sendFile(path.resolve((pathFile)))
        } else {
            res.status(200).send({message: 'image does not exist'})
        }
    })
}

module.exports = {
  pruebas,
  saveUser,
  loginUser,
  updateUser,
  uploadImage,
  getImageFile
};