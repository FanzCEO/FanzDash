function counter(end, duration) {
  return {
    current: 0, // start
    counting: false, // check

    // Format
    formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    startCounting() {
      // formater
      end = parseInt(end.toString().replace(/,/g, ''), 10); 

      // prevent
      if (this.counting || this.current >= end) return;
      
      this.counting = true;

      const start = this.current;
      const range = end - start;
      const startTime = performance.now();

      const update = (now) => {
        const elapsedTime = now - startTime;
        if (elapsedTime < duration * 1000) {
          const progress = elapsedTime / (duration * 1000);
          this.current = Math.round(start + progress * range); // Tetap numerik untuk penghitungan
          requestAnimationFrame(update);
        } else {
          // complete
          this.current = end;
          this.counting = false; // Reset
        }
      };

      requestAnimationFrame(update);
    }
  };
}

function progressCircle(end, duration) {
  return {
    percentage: 0,
    strokeDashoffset: 283,
    isProgressing: false, // Flag to prevent repeated execution
    startProgress() {
      if (this.isProgressing || this.percentage >= end) return; // Prevent re-running if already progressing or completed

      this.isProgressing = true; // Set flag to true when progress starts
      const interval = (duration * 1000) / end;
      
      let counter = setInterval(() => {
        this.percentage += 1;
        this.strokeDashoffset = 283 - (283 * this.percentage / 100);
        
        if (this.percentage >= end) {
          clearInterval(counter); // Stop the progress when end is reached
          this.isProgressing = false; // Reset flag after completion
        }
      }, interval);
    }
  };
}


function musicPlayer() {
  return {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    currentTrackIndex: 0,
    currentTrack: { title: 'Dreamy Horizons' },
    audio: new Audio(),
    playlist: [
      { title: 'Dreamy Horizons', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { title: 'Mystic Mountains', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      { title: 'Sunset Serenade', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
      { title: 'Midnight Journey', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
      { title: 'Ethereal Echoes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' }
      ],
    togglePlayPause() {
      if (this.isPlaying) {
        this.audio.pause();
      } else {
        this.audio.play();
      }
      this.isPlaying = !this.isPlaying;
    },
    prevTrack() {
      this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
      this.loadTrack();
      this.audio.play();
      this.isPlaying = true;
    },
    nextTrack() {
      this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
      this.loadTrack();
      this.audio.play();
      this.isPlaying = true;
    },
    selectTrack(index) {
      this.currentTrackIndex = index;
      this.loadTrack();
      this.audio.play();
      this.isPlaying = true;
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    },
    updateTime() {
      this.currentTime = this.audio.currentTime;
    },
    loadTrack() {
      this.audio.src = this.playlist[this.currentTrackIndex].url;
      this.currentTrack = this.playlist[this.currentTrackIndex];
      this.audio.load();
      this.audio.addEventListener('loadedmetadata', () => {
        this.duration = this.audio.duration;
      });
    },
    init() {
      this.loadTrack();
      this.audio.addEventListener('timeupdate', () => {
        this.updateTime();
        if (this.audio.ended) {
          this.nextTrack();
        }
      });
    }
  }
}

function zoomableImage() {
  return {
    scale: 1,
    zoomFactor: 1.1,
    zoomIn() {
      this.scale *= this.zoomFactor;
    },
    zoomOut() {
      this.scale /= this.zoomFactor;
    },
    zoom(event) {
      const direction = event.deltaY > 0 ? 1 : -1;
      const factor = Math.pow(this.zoomFactor, direction);
      this.scale *= factor;
    }
  };
}

function backgroundStep() {
  return {
    activeBox: 1,
    direction: 1,
    start() {
      setInterval(() => {
        if (this.activeBox === 12) {
          this.direction = -1;
        } else if (this.activeBox === 1) {
          this.direction = 1;
        }
        this.activeBox += this.direction;
      }, 100);
    }
  }
}

function backgroundChanger() {
  return {
    activeBox: 1,
    direction: 1,
    start() {
      setInterval(() => {
        if (this.activeBox === 13) {
          this.direction = -1;
        } else if (this.activeBox === 1) {
          this.direction = 1;
        }
        this.activeBox += this.direction;
      }, 100);
    }
  }
}