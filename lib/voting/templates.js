(function () {
  'use strict';

  var define = require('amdefine')(module);

  var deps = [
    'request',

    '../template',
  ];

  define(deps, function (request, template) {
    var kitten = '';

    function percent(n) {
      return Math.floor(n * 1000) / 10;
    }

    /**
     * Get a random kitten to be used by the bot.
     */
    function updateKittenImage() {
      var self = this;

      request('https://thecatapi.com/api/images/get?format=html', function (err, resp, body) {
        if (err) {
          console.error(err);
          console.error(err.stack);
          return;
        }
        kitten = body;
      });
    };

    // Immediately fetch a new kitten image.
    updateKittenImage();

    module.exports = function (votingConfig) {
      var templates = {
        votePassComment: template.render('voting/votePassComment.md'),
        voteFailComment: template.render('voting/voteFailComment.md'),
        modifiedWarning: template.render('voting/modifiedWarning.md'),
        couldntMergeWarning: template.render('voting/couldntMergeWarning.md'),
        voteStartedComment: template.render('voting/voteStarted.md', {
          period: votingConfig.period,
          jitter: votingConfig.period_jitter * 100 / 2,
          majority: votingConfig.supermajority * 100,
          min_votes: votingConfig.minVotes,
        }),
      };

      templates.voteEndComment = function (pass, yea, nay, nonStarGazers) {
        var total = yea + nay;
        var yeaPercent = percent(yea / total);
        var nayPercent = percent(nay / total);

        var resp = '#### ' + (pass ? (kitten + templates.votePassComment) : template.voteFailComment) + '\n\n' +
            '----\n' +
            '**Tallies:**\n' +
            ':+1:: ' + yea + ' (' + yeaPercent + '%) \n' +
            ':-1:: ' + nay + ' (' + nayPercent + '%)';
        if (nonStarGazers.length > 0) {
          resp += "\n\n";
          resp += "These users aren't stargazers, so their votes were not counted: \n";
          nonStarGazers.forEach(function (user) {
            resp += " * @" + user + "\n";
          });
        }
        updateKittenImage();
        return resp;
      };

      templates.nonStarGazerComment = function (voteCast, body, user) {
        return (template.render('voting/nonStarGazerVote.md', {
          user: user,
          body: body,
          vote: voteCast,
          stargazerRefreshInterval: votingConfig.pollInterval,
        }));
      };

      return templates;
    };
  });
}());
