(function ($) {
	"use strict";
	console.clear();
	$.fn.makeSpin = function ({eImagesFolder, eSegments, eBuffer, eHeight, eWidth, eFrames}) {
		var currentAudio;
		var rangeBuffer = eBuffer;
		var showBullets = false;
		var height = eHeight;
		var width = eWidth;
		var frames = eFrames;

		var mainHolder 		= $(this);
		
		var spinHolder 		= $("<div/>",{"class":"spriteSpin" }).appendTo(mainHolder);
		var segmentHolder 	= $("<div/>",{"class":"segment"    }).appendTo(mainHolder);
		var topicHolder 	= $("<div/>",{"class":"topic"      }).appendTo(mainHolder);
		
		var btnHolder  		= $("<div/>",{"class":"btnHolder"  }).appendTo(mainHolder);
		var spinPrevBTN 	= $("<div/>",{"class":"LuciBTN spinPrev", text:"PREV"}).appendTo(btnHolder);
        var spinNextBTN 	= $("<div/>",{"class":"LuciBTN spinNext", text:"NEXT"}).appendTo(btnHolder);


		function infoPop(info, thisType) {
			var showFrame = info.frame;
			var S = info;
			var iconBG = (S.iconBG)? '<img class="iconBG" src="'+eImagesFolder+'/ux/'+S.iconBG+'">': ''
			S.div = $(	'<div class="msgHolder ' + thisType + '" style="top:'+S.position[0]+'px; left:'+S.position[1]+'px; color:'+S.color+'; border-color:'+S.color+';">'+
							'<div class="msgBox">'+		
								'<div class="close">X</div>'+
								'<h2>'+S.title+'</h2>'+
								'<p></p>'+
							'</div>'+
							'<div class="icon">'+
							iconBG+
							'<img src="'+eImagesFolder+'/ux/'+S.icon+'">'+
							'</div>'+
						'</div>');

			var msgBody = S.div.find("p");

			/****************************************************************
			 * Segments
			 ****************************************************************/
			if (thisType === "segment") {
				var myUL = $("<ul/>");
				$.each(S.bullets, function () {
					$("<li/>", {
						'text': this
					}).appendTo(myUL);
				});
				S.div.find('.msgClose').hide();
				S.div.appendTo(segmentHolder);
				if(!showBullets){ msgBody.hide(); }
			}

			/****************************************************************
			 * Topics
			 ****************************************************************/
			if (thisType === "topic") {
				$("<span/>", {
					text: S.body
				}).appendTo(msgBody);
				S.div.appendTo(topicHolder);
			}

			S.orgPos = S.div[0].getBoundingClientRect();

			var tl = new TimelineMax({paused: true});
				tl.from(S.div, 0.25, {autoAlpha: 0});
				tl.from(S.div.find(".icon"), 0.25, {scale: 0.5}, "-=.25");
			    if (thisType === "topic") {tl.addPause("showMessage");}
				tl.from(S.div, 0.5, { scale: 0.5, ease: Back.easeInOut	});
				tl.from(S.div.find(".msgBox"), 0.5, {autoAlpha:0, css: {'padding': 0,'width': 0,'height': 0 }});
				tl.from(S.div.find("h2"), 0.3, {autoAlpha:0, x:"+=10px"});
				tl.from(S.div.find("p"), 0.3, {autoAlpha:0, x:"-=10px"});

			function pause() {
				tl.pause();
			}

			/****************************************************************
			 * Functions & Listeners
			 ****************************************************************/
			function animate(e) {
				var action = e.data[0] || e.type;

				if(info.audio){
					$("body").trigger("stopIntro");
					if(action === "reverse"){ 
    					info.audio.pause();
					} else {
						if(currentAudio) currentAudio.pause()
						currentAudio = info.audio
						info.audio.currentTime = 0;
   					    info.audio.play();
					}
				}
				if(action === "reverse"){ 
					tl.reverse();
				} else {
					tl.play("showMessage");
				}
				
			}

			$(S.div).on("play", animate);
			$(S.div).on("reverse", animate);

			S.div.find(".close").on('click', ['reverse'], animate);
			S.div.find(".icon").on('click', ['play'], animate);

			function inRange() {
				if (frameHeard < showFrame + rangeBuffer &&
					frameHeard > showFrame - rangeBuffer &&
					tl.progress() === 0) {
					return true;
				} else {
					return false;
				}
			}
			var timer;

			function listenToFrame(e, frameHeard) {
				if (frameHeard < showFrame + rangeBuffer &&
					frameHeard > showFrame - rangeBuffer) {

					timer = setTimeout(function () {
						if (frameHeard === currentFrame && tl.progress() === 0) {
							tl.timeScale(1);

							if (thisType === "topic")   { tl.play("shown"); }
							if (thisType === "segment") { tl.play();		}

						}
					}, 500);

				} else {
					tl.timeScale(5);
					tl.reverse();
					window.clearTimeout(timer);
				}
			}
			$(S.div).on('spinning', listenToFrame);

			return S;
		}
		var segmentObjects = [];
		var segmentFrames = [];
		var topicObjects = [];
		$.each(eSegments, function () {
			var topicObject = infoPop(this, 'segment');
			segmentObjects.push(topicObject);
			segmentFrames.push(this.frame);
			$.each(this.topics, function () {
				var topicObject = infoPop(this, 'topic');
				topicObjects.push(topicObject);
			});
		});
		console.table(segmentObjects)
		console.table(topicObjects)

		/*******************************************************************************************
		 * SPIN
		 *******************************************************************************************/
		console.log(eImagesFolder+'img/img{frame}.jpg')
		var frames = SpriteSpin.sourceArray(eImagesFolder+'img/img{frame}.jpg', {
			frame: [1, frames],
			digits: 4
		});
		var currentFrame;

		spinHolder.spritespin({
			source: frames,
			width: width,
			height: height,
			sense: -2,
			animate: false,
			frame: 0
		});
		
		var api = spinHolder.spritespin("api");
		spinHolder.on("onLoad", function () {
			segmentFrames.unshift(segmentFrames.pop());
			$(spinNextBTN).trigger('click');
		});
		spinHolder.on("onFrame", function () {
			$(".msgHolder").trigger('spinning', [api.data.frame]);
			currentFrame = api.data.frame;
		});

		function spinTo() {
			var myClass = $(this).attr("class");
			if (/next/gi.test(myClass)) { 
				api.data.reverse = false;		
				segmentFrames.push(segmentFrames.shift());
			} else {
				api.data.reverse = true;
				segmentFrames.unshift(segmentFrames.pop());
			}
			api.playTo(segmentFrames[0]);
		}
		$(spinPrevBTN).on('click', spinTo);
		$(spinNextBTN).on('click', spinTo);

		function spinStart() {
			api.toggleAnimation();
		}
		$("#spin").on('click', spinStart);
		
		function myResize(){
			var newScale = Math.min( 
			  $(mainHolder).parent().width() / width, 
			  window.innerHeight / 697 
			);
			var scale = (newScale > 1)? 1: newScale;
   		    console.log(scale);
			
			$(mainHolder).css({
				transform: "scale(" + scale + ") translate(-50%, -50%)"
			});
		}
		
		$(window).on("resize", myResize);
		myResize();
	};
}(jQuery));

