'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePagination = require('mongoose-pagination');

var Album = require('../models/album');
var Song = require('../models/song');

function getAlbum(req, res){
    var albumId = req.params.id;

    Album.findById(albumId).populate({path: 'artist'}).exec((err, album)=> {
        if (err){
            res.status(500).send({message: 'error in the request'});
        } else {
            if (!album) {
                res.status(404).send({message: 'album not found'});
            } else {
                res.status(200).send({album});
            }
        }
    })
}

function getAlbums (req, res){
    var artistId = req.params.artist

    if(!artistId) {
        var find = Album.find({}).sort('title');
    } else {
        var find = Album.find({artist: artistId}).sort('year');
    }
    find.populate({path: 'artist'}).exec((err, albums)=> {
        if (err){
            res.status(500).send({message: 'error in the request'});
        } else {
            if (!albums) {
                res.status(404).send({message: 'did not find any album'});
            } else {
                res.status(200).send({albums});
            }
        }
    })
}

function saveAlbum(req, res){
    var album = new Album();

    var params = req.body;
    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.artist = params.artist;
    album.image = 'null';

    album.save((err, albumStored)=>{
        if (err){
            res.status(500).send({message: 'error saving album'});
        } else {
            if (!albumStored) {
                res.status(404).send({message: 'album not saved'});
            } else {
                res.status(200).send({album: albumStored});
            }
        }
    });
}

function updateAlbum(req, res){

    var albumId = req.params.id;
    var update = req.body;
    Album.findByIdAndUpdate(albumId, update,  (err, albumUpdated)=>{
        if (err){
            res.status(500).send({message: 'error updating album'});
        } else {
            if (!albumUpdated) {
                res.status(404).send({message: 'album not updated'});
            } else {
                res.status(200).send({album: albumUpdated});
            }
        }
    });
}

function deleteAlbum(req, res){

    var albumId = req.params.id;
    Album.findByIdAndRemove(albumId, (err, albumRemoved)=>{
        if (err){
            res.status(500).send({message: 'error deleting album'});
        } else {
            if (!albumRemoved) {
                res.status(404).send({message: 'album not deleted'});
            } else {
                Song.find({album: albumRemoved._id}).remove((err, songRemoved)=>{
                    if (!songRemoved) {
                        res.status(404).send({message: 'song not deleted'});
                    } else {
                        res.status(200).send({album: albumRemoved});
                    }
                })
            }
        }
    });
}

function uploadImage (req, res) {
    var albumId = req.params.id;
    var file_name = 'not uploaded';

    if (req.files) {

        //path should be req.files.image.path
        var filePath = req.files.null.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2];

        var extSplit = fileName.split('\.');
        var fileExt = extSplit[1]; 

        if (fileExt === 'png' || fileExt === 'jpg' || fileExt === 'gif') {
            Album.findByIdAndUpdate(albumId, {image: fileName}, (err, albumUpdated) =>{
                if (err) {
                    res.status(500).send({message: 'error updating album image'});
                } else {
                    if (!albumUpdated){
                        res.status(404).send({message: 'album not found'});
                    } else {
                        res.status(200).send({album: albumUpdated});
                    }
                }
            });
        } else {
            res.status(200).send({message: 'invalid image format'});
        }
        
    } else {
        res.status(200).send({message: 'image not uploaded'});
    }
}

function getImageFile (req, res) {
    var imageFile = req.params.imageFile;
    var pathFile = './uploads/albums/' + imageFile;
    fs.exists(pathFile, (exists)=>{
        if (exists){
            res.sendFile(path.resolve((pathFile)));
        } else {
            res.status(200).send({message: 'image does not exist'});
        }
    })
}

module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
}