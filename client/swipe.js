/*
Swiper = new Swipe(['main', 'explore']);


Template.leaderboard_phone.helpers({
  'Swiper' : function() {
    return Swiper;
  }
})

Template.leaderboard_phone.rendered = function(){

  Swiper.setPageHard('main');
  Tracker.autorun(function(){
    if (Swiper.pageIs('explore')){
      Swiper.leftRight(null, 'main')
    }
    else if (Swiper.pageIs('main')){
      Swiper.leftRight('explore', null)
    }
    else if (Swiper.pageIs('myprof')){
      Swiper.leftRight('main', null)
    }
  })
}
*/