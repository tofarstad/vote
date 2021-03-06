var mongoose = require('mongoose');
var Alternative = require('../models/alternative');
var Vote = require('../models/vote');
var errors = require('../errors');

exports.create = function(req, res, next) {
    var alternativeId = req.body.alternativeId;
    if (!alternativeId) {
        var error = new errors.InvalidPayloadError('alternativeId');
        return errors.handleError(res, error);
    }

    return Alternative.findById(alternativeId)
        .populate('votes')
        .exec()
        .then(function(alternative) {
            if (!alternative) throw new errors.NotFoundError('alternative');
            return alternative.addVote(req.user);
        })
        .then(function(vote) {
            return vote.populate('alternative').execPopulate();
        })
        .then(function(vote) {
            return res.status(201).send(vote);
        })
        .catch(mongoose.Error.CastError, function(err) {
            throw new errors.NotFoundError('alternative');
        })
        .catch(next);
};

exports.retrieve = function(req, res, next) {
    var hash = req.get('Vote-Hash');

    if (!hash) {
        var error = new errors.MissingHeaderError('Vote-Hash');
        return errors.handleError(res, error);
    }

    return Vote.findOne({ hash: hash })
        .populate('alternative')
        .exec()
        .then(function(vote) {
            if (!vote) throw new errors.NotFoundError('vote');
            return vote.alternative.populate('election').execPopulate()
                .then(function(alternative) {
                    return res.json(vote);
                });
        })
        .catch(next);
};
