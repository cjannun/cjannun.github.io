/**
 * portfolio.js
**/
{
  class TextFX {
      constructor(el) {
          this.DOM = {el: el};
          // The texts (repeated)
          this.DOM.texts = [...this.DOM.el.querySelectorAll('.content__text')];
          this.DOM.textsTotal = this.DOM.texts.length;
          // The index of the main text element
          this.middleIdx = Math.floor(this.DOM.textsTotal/2);
          // Time between each showing/hiding of each text instance
          this.loopInterval = {show: 120, hide: 120};
          // optional: Extra time to the whole show/hide animation. 
          this.loopEndIddleTime = this.loopInterval.show;
      }
      show({dir = 'both', halfwayCallback = null} = {}) {
          return new Promise((resolve, reject) => {
              const loopHide = (pos) => {
                  if ( this.middleIdx-pos === this.middleIdx ) {
                      setTimeout(resolve, this.loopEndIddleTime);
                      return;
                  }
                  this.hideText(pos, dir);
                  setTimeout(() => loopHide(pos-1), this.loopInterval.hide);
              };
              const loopShow = (pos) => {
                  if ( this.middleIdx-pos > this.middleIdx ) {
                      if ( halfwayCallback && typeof halfwayCallback === 'function') {
                          halfwayCallback();
                      }
                      loopHide(this.middleIdx);
                      return;
                  }
                  this.showText(pos, dir);
                  setTimeout(() => loopShow(pos-1), this.loopInterval.show);
              };
              loopShow(this.middleIdx);
          });
      }
      hide({dir = 'both', halfwayCallback = null} = {}) {
          return new Promise((resolve, reject) => {
              const loopHide = (pos) => {
                  if ( this.middleIdx-pos < 0 ) {
                      setTimeout(resolve, this.loopEndIddleTime);
                      return;
                  }
                  this.hideText(pos, dir);
                  setTimeout(() => loopHide(pos+1), this.loopInterval.hide);
              };
              const loopShow = (pos) => {
                  if ( this.middleIdx-pos < 0 ) {
                      if ( halfwayCallback && typeof halfwayCallback === 'function') {
                          halfwayCallback();
                      }
                      loopHide(0);
                      return;
                  }
                  this.showText(pos, dir);
                  setTimeout(() => loopShow(pos+1), this.loopInterval.show);
              };
              loopShow(1);
          });
      }
      // Hides one (dir = 'up' or dir = 'down') or more texts, specifically the equally distant texts from main text (dir = 'both')
      hideText(pos, dir) {
          this.toggleText('hide', pos, dir);
      }
      showText(pos, dir) {
          this.toggleText('show', pos, dir);
      }
      toggleText(action, pos, dir) {
          const changeStyle = {
              up: _ => {
                  this.DOM.texts[this.middleIdx-pos].style.opacity = action === 'show' ? 1 : 0;
              },
              down: _ => {
                  this.DOM.texts[this.middleIdx+pos].style.opacity = action === 'show' ? 1 : 0;
              }
          };
          if ( dir === 'both' ) {
              changeStyle['up']();
              changeStyle['down']();
          }
          else {
              changeStyle[dir]();
          }
      }
  }

  class Slide {
      constructor(el) {
          this.DOM = {el: el};
          this.DOM.img = {
              wrap: this.DOM.el.querySelector('.content__img'),
              inner: this.DOM.el.querySelector('.content__img-inner')
          };
          // The text effect class.
          this.textFX = new TextFX(this.DOM.el.querySelector('.content__text-wrap'));
      }
      // Hide the Slide's image
      hideImage(dir) {
          this.toggleImage('hide', dir);
      }
      // Show the Slide's image
      showImage(dir) {
          this.toggleImage('show', dir);
      }
      toggleImage(action, dir) {
          new TimelineMax().add('begin')
          .to(this.DOM.img.wrap, 
            // change slide transition time here
            action === 'hide' ? 3 : 4, { 
              ease: action === 'hide' ? Quint.easeOut : Quint.easeOut,
              startAt: action === 'hide' ? {} : {x: dir === 'next' ? '110%' : '-110%', opacity: 1},
              x: action === 'hide' ? dir === 'next' ? '-110%' : '110%' : '0%'
          }, 'begin')
          .to(this.DOM.img.inner, 
            // change slide transition time here
            action === 'hide' ? 3 : 4, { 
              ease: action === 'hide' ? Quint.easeOut : Quint.easeOut,
              startAt: action === 'hide' ? {} : {x: dir === 'next' ? '110%' : '-110%'},
              x: action === 'hide' ? dir === 'next' ? '-110%' : '110%' : '0%'
          }, 'begin');
      }
  }

  class Slideshow {
      constructor(el) {
          this.DOM = {el: el};
          // Navigation controls
          this.DOM.nav = {
              prev: this.DOM.el.querySelector('.content__nav-button--prev'),
              curr: this.DOM.el.querySelector('.content__nav-button--curr'),
              next: this.DOM.el.querySelector('.content__nav-button--next')
          };
          // All slides
          this.slides = [];
          [...this.DOM.el.querySelectorAll('.content__slide')].forEach(slide => this.slides.push(new Slide(slide)));
          // Total number of slides
          this.slidesTotal = this.slides.length;
          // Current slide position
          this.current = 0;
          // Show the first one
          this.slides[this.current].DOM.el.classList.add('content__slide--current');
          // Initialize some events
          this.initEvents();
      }
      initEvents() {
          // Clicking next and previous controls.
          this.onClickPrevFn = _ => this.navigate('prev');
          this.onClickNextFn = _ => this.navigate('next');
          this.DOM.nav.prev.addEventListener('click', this.onClickPrevFn);
          this.DOM.nav.next.addEventListener('click', this.onClickNextFn);
      }
      navigate(dir) {
          if ( this.isAnimating ) {
              return false;
          }
          this.isAnimating = true;
          // Current slide
          const currentSlide = this.slides[this.current];
          
          // Update current
          this.current = dir === 'next' ? 
              this.current < this.slidesTotal - 1 ? this.current + 1 : 0 :
              this.current > 0 ? this.current - 1 : this.slidesTotal - 1;
              
          // Upcoming slide
          const upcomingSlide = this.slides[this.current];

          const onCurrentHalfwayCallback = () => {
              // Hide the current slide's image
              currentSlide.hideImage(dir);
              // Set the upcoming slide's main text opacity to 1.
              upcomingSlide.textFX.DOM.texts[upcomingSlide.textFX.middleIdx].style.opacity = 0;
              // Add current class to the upcoming slide (opacity = 1)
              upcomingSlide.DOM.el.classList.add('content__slide--current');
              // Show the upcoming slide's image
              upcomingSlide.showImage(dir);
          };
          const onCurrentEndCallback = () => {
              // Remove the current class from the current slide.
              currentSlide.DOM.el.classList.remove('content__slide--current');
              upcomingSlide.textFX.show().then(() => this.isAnimating = false);
          };

          // Hide the current slide's text, 
          // and call onCurrentHalfwayCallback at half of the animation
          // In the end call onCurrentEndCallback
          currentSlide.textFX.hide({halfwayCallback: onCurrentHalfwayCallback}).then(onCurrentEndCallback);

          if (this.current === 1) {
            this.DOM.nav.prev.innerHTML = 'about me';
            this.DOM.nav.curr.innerHTML = 'experience';
            this.DOM.nav.next.innerHTML = 'skills'; 
          }

          if (this.current === 2) {
            this.DOM.nav.prev.innerHTML = 'experience';
            this.DOM.nav.curr.innerHTML = 'skills';
            this.DOM.nav.next.innerHTML = 'about me';             
          }

          if (this.current === 0) {
            this.DOM.nav.prev.innerHTML = 'skills';
            this.DOM.nav.curr.innerHTML = 'about me'
            this.DOM.nav.next.innerHTML = 'experience';
          }
      }
  }

  // Initialize the slideshow
  new Slideshow(document.querySelector('.content'));
  
}