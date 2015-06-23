Timer = new Mongo.Collection("timer");
var TIMER_VALUE = 30 * 1000;

Clicks = new Mongo.Collection("clicks");

if(Meteor.isClient){
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });

  Template.timer.helpers({
    s: function () {
      return Timer.findOne().value/1000;
    }
  });

  Template.thebutton.helpers({
    loggedIn: function () {
      return Meteor.user();
    },
    didClick: function(){
      return !!Clicks.findOne({userId: Meteor.userId()});
    },
    pushedAt: function(){
      if(!!Clicks.findOne({userId: Meteor.userId()})){
        return Clicks.findOne({userId: Meteor.userId()}).time;
      } else return "PUSH";
    }
  });

  Template.thebutton.events({
    'click': function () {
      Clicks.insert({
        userId: Meteor.userId(),
        username: Meteor.user().username,
        time: Timer.findOne().value/1000
      });
      Timer.update(Timer.findOne()._id, {
        $set: {value: TIMER_VALUE}
      })
    }
  });

  Template.leaders.helpers({
    clickers: function () {
      return Clicks.find({}, {sort: {time: 1}});
    }
  });
}

if(Meteor.isServer){
  Meteor.startup(function(){
    if(!Timer.findOne()){
      Timer.insert({value: TIMER_VALUE});
    }

    Meteor.setInterval(function(){
      var timer = Timer.findOne();
      timer.value -= 1000;
      timer.value = timer.value < 0 ? TIMER_VALUE : timer.value;
      Timer.update(timer._id, {value: timer.value});
    }, 1000);
  });
}