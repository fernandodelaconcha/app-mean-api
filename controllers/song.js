'use strict'

var path = require('path');
var fs = require('fs');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getSong (req, res){
    var songId = req.params.id
    Song.findById(songId).populate({path: 'album'}).exec((err, song)=> {
        if (err){
            res.status(500).send({message: 'error in the request'});
        } else {
            if (!song) {
                res.status(404).send({message: 'did not find any song'});
            } else {
                res.status(200).send({song});
            }
        }
    })
}

function getSongs (req, res){
    var albumId = req.params.album

    if(!albumId) {
        var find = Song.find({}).sort('name');
    } else {
        var find = Song.find({album: albumId}).sort('number');
    }
    find.populate({
        path: 'album',
        populate: {
            path: 'artist',
            model: 'Artist'
        }
    }).exec((err, songs)=> {
        if (err){
            res.status(500).send({message: 'error in the request'});
        } else {
            if (!songs) {
                res.status(404).send({message: 'did not find any song'});
            } else {
                res.status(200).send({songs});
            }
        }
    })
}


function saveSong(req, res){
    var song = new Song();

    var params = req.body;
    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = 'null';
    song.album = params.album

    song.save((err, songStored)=>{
        if (err){
            res.status(500).send({message: 'error saving song'});
        } else {
            if (!songStored) {
                res.status(404).send({message: 'song not saved'});
            } else {
                res.status(200).send({song: songStored});
            }
        }
    });
}

function updateSong(req, res){
    var songId = req.params.id;
    var update = req.body;
    Song.findByIdAndUpdate(songId, update,  (err, songUpdated)=>{
        if (err){
            res.status(500).send({message: 'error updating song'});
        } else {
            if (!songUpdated) {
                res.status(404).send({message: 'song not updated'});
            } else {
                res.status(200).send({song: songUpdated});
            }
        }
    });
}

function deleteSong(req, res){
    var songId = req.params.id;
    Song.findByIdAndRemove(songId, (err, songRemoved)=>{
        if (err){
            res.status(500).send({message: 'error deleting song'});
        } else {
            if (!songRemoved) {
                res.status(404).send({message: 'song not deleted'});
            } else {
                res.status(200).send({album: songRemoved});
            }
        }
    })
}

function uploadFile (req, res) {
    var songId = req.params.id;
    var file_name = 'not uploaded';

    if (req.files) {

        //path should be req.files.file.path
        var filePath = req.files.file.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2];

        var extSplit = fileName.split('\.');
        var fileExt = extSplit[1]; 

        if (fileExt === 'mp3' || fileExt === 'ogg') {
            Song.findByIdAndUpdate(songId, {file: fileName}, (err, songUpdated) =>{
                if (err) {
                    res.status(500).send({message: 'error updating song file'});
                } else {
                    if (!songUpdated){
                        res.status(404).send({message: 'song not found'});
                    } else {
                        res.status(200).send({song: songUpdated});
                    }
                }
            });
        } else {
            res.status(200).send({message: 'invalid file format'});
        }
        
    } else {
        res.status(200).send({message: 'file not uploaded'});
    }
}

function getSongFile (req, res) {
    var songFile = req.params.songFile;
    var pathFile = './uploads/songs/' + songFile;
    fs.exists(pathFile, (exists)=>      {
        if (exists){
            res.sendFile(path.resolve((pathFile)));
        } else {
            res.status(200).send({message: 'song file does not exist'});
        }
    })
}

module.exports = {
    getSong,
    getSongs,
    saveSong,
    updateSong,
    deleteSong,
    uploadFile,
    getSongFile
}