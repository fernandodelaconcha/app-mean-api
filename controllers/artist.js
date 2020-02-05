'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePagination = require('mongoose-pagination')

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getArtist(req, res){
    var artistId = req.params.id;

    Artist.findById(artistId, (err, artist)=> {
        if (err){
            res.status(500).send({message: 'error in the request'})
        } else {
            if (!artist) {
                res.status(404).send({message: 'artist not found'})
            } else {
                res.status(200).send({artist})
            }
        }
    })
}

function getArtists (req, res){
    var page = req.params.page || 1;
    var itemsPerPage = 4;

    Artist.find().sort('name').paginate(page, itemsPerPage, (err, artists, total)=>{
        if (err) {
            res.status(500).send({message: 'error in the request'})
        } else {
            if (!artists) {
                res.status(404).send({message: 'could not find any artist'})
            } else {
                return res.status(200).send({total: total, artists})
            }
        }
    });
}

function saveArtist(req, res){
    var artist = new Artist();

    var params = req.body;
    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';

    artist.save((err, artistStored)=>{
        if (err){
            res.status(500).send({message: 'error saving artist'})
        } else {
            if (!artistStored) {
                res.status(404).send({message: 'artist not saved'})
            } else {
                res.status(200).send({artist: artistStored})
            }
        }
    });
}

function updateArtist(req, res){

    var artistId = req.params.id;
    var update = req.body;
    Artist.findByIdAndUpdate(artistId, update,  (err, artistUpdated)=>{
        if (err){
            res.status(500).send({message: 'error updating artist'})
        } else {
            if (!artistUpdated) {
                res.status(404).send({message: 'artist not updated'})
            } else {
                res.status(200).send({artist: artistUpdated})
            }
        }
    });
}

function deleteArtist(req, res){

    var artistId = req.params.id;
    Artist.findByIdAndRemove(artistId, (err, artistRemoved)=>{
        if (err){
            res.status(500).send({message: 'error deleting artist'})
        } else {
            if (!artistRemoved) {
                res.status(404).send({message: 'artist not deleted'})
            } else {
                Album.find({artist: artistRemoved._id}).remove((err, albumRemoved)=>{
                    if (!albumRemoved) {
                        res.status(404).send({message: 'album not deleted'})
                    } else {
                        Song.find({album: albumRemoved._id}).remove((err, songRemoved)=>{
                            if (!songRemoved) {
                                res.status(404).send({message: 'song not deleted'})
                            } else {
                                res.status(200).send({artist: artistRemoved})
                            }
                        })
                    }
                })
            }
        }
    });
}

function uploadImage (req, res) {
    var artistId = req.params.id;
    var file_name = 'not uploaded';

    if (req.files) {

        //path should be req.files.image.path
        var filePath = req.files.null.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2]

        var extSplit = fileName.split('\.');
        var fileExt = extSplit[1]; 

        if (fileExt === 'png' || fileExt === 'jpg' || fileExt === 'gif') {
            Artist.findByIdAndUpdate(artistId, {image: fileName}, (err, artistUpdated) =>{
                if (err) {
                    res.status(500).send({message: 'error updating artist image'});
                } else {
                    if (!artistUpdated){
                        res.status(404).send({message: 'artist not found'});
                    } else {
                        res.status(200).send({artist: artistUpdated});
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
    var pathFile = './uploads/artists/' + imageFile
    fs.exists(pathFile, (exists)=>{
        if (exists){
            res.sendFile(path.resolve((pathFile)))
        } else {
            res.status(200).send({message: 'image does not exist'})
        }
    })
}

module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
}